import { readFile } from 'fs/promises'
import path from 'path'
import { initAdmin } from '../../admin/init-admin'
import { APP_ADMIN_CONFIG } from '../../common/config/app.config'
import { logger } from '../../common/utils/log/logger.log'
import { pool } from '../check-db.app'

export const initDB = async (): Promise<void> => {
	try {
		const initExtensionSqlDB = await readFile(
			path.join(__dirname, '../../../db/migrations/extension.db.sql'),
			'utf-8'
		)
		const initHandlerSqlDB = await readFile(
			path.join(__dirname, '../../../db/migrations/handler.db.sql'),
			'utf-8'
		)
		const initTypeSqlDB = await readFile(
			path.join(__dirname, '../../../db/migrations/type.db.sql'),
			'utf-8'
		)
		const initTablesSqlDB = await readFile(
			path.join(__dirname, '../../../db/migrations/tables.db.sql'),
			'utf-8'
		)
		const initTriggerSqlDB = await readFile(
			path.join(__dirname, '../../../db/migrations/trigger.db.sql'),
			'utf-8'
		)

		await pool.query(initExtensionSqlDB)
		await pool.query(initHandlerSqlDB)
		await pool.query(initTypeSqlDB)
		await pool.query(initTablesSqlDB)
		await pool.query(initTriggerSqlDB)

		// Migrate existing columns from TIMESTAMP to TIMESTAMPTZ — runs only once
		try {
			await pool.query(`
				DO $$
				BEGIN
					-- Only migrate if expires_license_at is still plain TIMESTAMP (without timezone)
					IF EXISTS (
						SELECT 1 FROM information_schema.columns
						WHERE table_schema = 'public'
						  AND table_name   = 'license'
						  AND column_name  = 'expires_license_at'
						  AND data_type    = 'timestamp without time zone'
					) THEN
						ALTER TABLE public.users
							ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
							ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

						ALTER TABLE public.sessions
							ALTER COLUMN expires_token_at      TYPE TIMESTAMPTZ USING expires_token_at      AT TIME ZONE 'UTC',
							ALTER COLUMN expires_forget_pass_at TYPE TIMESTAMPTZ USING expires_forget_pass_at AT TIME ZONE 'UTC',
							ALTER COLUMN created_at            TYPE TIMESTAMPTZ USING created_at            AT TIME ZONE 'UTC',
							ALTER COLUMN updated_at            TYPE TIMESTAMPTZ USING updated_at            AT TIME ZONE 'UTC';

						ALTER TABLE public.license
							ALTER COLUMN expires_license_at TYPE TIMESTAMPTZ USING expires_license_at AT TIME ZONE 'UTC',
							ALTER COLUMN created_at         TYPE TIMESTAMPTZ USING created_at         AT TIME ZONE 'UTC',
							ALTER COLUMN updated_at         TYPE TIMESTAMPTZ USING updated_at         AT TIME ZONE 'UTC';
					END IF;
				END
				$$;
			`)
		} catch (error) {
			logger.warn('Timestamp migration notice: ' + (error instanceof Error ? error.message : String(error)))
		}

		logger.info('✅ Database success init')

		const adminEmail = APP_ADMIN_CONFIG.ADMIN_EMAIL
		const adminPhone = APP_ADMIN_CONFIG.ADMIN_PHONE
		const adminVerify = APP_ADMIN_CONFIG.ADMIN_IS_VERIFY
		const adminPass = APP_ADMIN_CONFIG.ADMIN_PASS

		if (
			!adminEmail ||
			!adminPass ||
			!adminPhone ||
			typeof adminVerify !== 'boolean'
		) {
			logger.error('Error-config admin-data is not set from env!')

			return
		}

		const admin = await initAdmin(
			adminEmail,
			adminPhone,
			adminVerify,
			adminPass
		)

		if ('message' in admin) {
			logger.error(admin.message)

			return
		}

		logger.info('✅ Admin success init')
	} catch (error) {
		logger.error('Database connection error:', error)
		throw error
	}
}
