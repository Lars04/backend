import type { Pool, QueryResult } from 'pg'
import type { Logger } from 'winston'
import type { ILicense } from '../app/db/types/license.types'
import { DB_TABLE_LICENSE, DB_TABLE_USERS } from '../common/constants/db.constants'
import type { TypeAppID } from '../common/types/app.types'
import { responseErrorDB } from '../common/utils/app/errorResponse.utils'
import type { CreateLicenseDto, EditLicenseDto } from './dto/license.dto'

export class LicenseModel {
	constructor(private pool: Pool, private logger: Logger) { }

	async createLicense(dto: CreateLicenseDto): Promise<TypeAppID | null> {
		console.log('=== CREATE LICENSE DTO ===', JSON.stringify(dto))
		try {
			await this.pool.query('BEGIN')

			const query = `
				INSERT INTO ${DB_TABLE_LICENSE}
				(user_id, license, expires_license_at)
				VALUES ($1, $2, $3)
				ON CONFLICT (user_id) DO UPDATE SET
					license = EXCLUDED.license,
					expires_license_at = EXCLUDED.expires_license_at,
					updated_at = now()
				RETURNING id
			`
			const queryResult = await this.pool.query<TypeAppID>(query, [
				dto.userId,
				dto.license?.toUpperCase(),
				dto.expiresLicenseAt,
			])

			const updateUserQuery = `
				UPDATE ${DB_TABLE_USERS}
				SET is_active_license = true
				WHERE id = $1
			`
			await this.pool.query(updateUserQuery, [dto.userId])

			await this.pool.query('COMMIT')
			return queryResult.rows[0] ?? null
		} catch (error) {
			await this.pool.query('ROLLBACK')
			console.error('=== CREATE LICENSE ERROR ===', error instanceof Error ? error.message : error)
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				`Error create license: ${error instanceof Error ? error.message : 'Unknown error'}`
			)

			return errorMessage
		}
	}

	async getAllLicense(
		isAdmin: boolean,
		userId: string,
		limit: number,
		offset: number
	): Promise<ILicense[] | null> {
		try {
			let query: string
			let queryResult: QueryResult<ILicense>

			if (isAdmin) {
				query = `SELECT * FROM ${DB_TABLE_LICENSE} ORDER BY created_at DESC LIMIT $1 OFFSET $2`
				queryResult = await this.pool.query<ILicense>(query, [limit, offset])
			} else {
				query = `SELECT * FROM ${DB_TABLE_LICENSE} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
				queryResult = await this.pool.query<ILicense>(query, [
					userId,
					limit,
					offset,
				])
			}

			return queryResult.rows.length ? queryResult.rows : null
		} catch (error) {
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				'Error get-all license:'
			)

			return errorMessage
		}
	}

	async getLicenseById(
		licenseId: string,
		userId: string,
		isAdmin: boolean
	): Promise<ILicense | null> {
		try {
			let query: string
			let queryResult: QueryResult<ILicense>

			if (isAdmin) {
				query = `SELECT * FROM ${DB_TABLE_LICENSE} WHERE id = $1`
				queryResult = await this.pool.query<ILicense>(query, [licenseId])
			} else {
				query = `SELECT * FROM ${DB_TABLE_LICENSE} WHERE id = $1 AND user_id = $2`
				queryResult = await this.pool.query<ILicense>(query, [
					licenseId,
					userId,
				])
			}

			return queryResult.rows[0] ?? null
		} catch (error) {
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				'Error get one license:'
			)

			return errorMessage
		}
	}

	async editLicense(
		licenseId: string,
		dto: EditLicenseDto
	): Promise<TypeAppID | null> {
		console.log(dto)
		try {
			const query = `
				UPDATE ${DB_TABLE_LICENSE} SET
				license = $1,
				expires_license_at = $2
				WHERE id = $3
				RETURNING id
			`
			const queryResult = await this.pool.query<TypeAppID>(query, [
				dto.license?.toUpperCase(),
				dto.expiresLicenseAt,
				licenseId,
			])

			if (queryResult.rowCount === 0) return null

			return queryResult.rows[0] ?? null
		} catch (error) {
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				'Error update-user license'
			)

			return errorMessage
		}
	}

	async removeLicense(licenseId: string): Promise<TypeAppID | null> {
		try {
			const query = `DELETE FROM ${DB_TABLE_LICENSE} WHERE id = $1 RETURNING id`
			const queryResult = await this.pool.query(query, [licenseId])

			return queryResult.rows[0] ?? null
		} catch (error) {
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				'Error remove-user license:'
			)

			return errorMessage
		}
	}
}
