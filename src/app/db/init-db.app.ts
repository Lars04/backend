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
