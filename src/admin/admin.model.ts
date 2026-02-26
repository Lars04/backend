import type { Pool } from 'pg'
import type { Logger } from 'winston'
import type { IUser, TypeUserID } from '../app/db/types/user.types'
import { DB_TABLE_LICENSE, DB_TABLE_USERS } from '../common/constants/db.constants'
import type { IAppMessage } from '../common/types/app.types'
import { responseErrorDB } from '../common/utils/app/errorResponse.utils'

import type { AdminUserEditDto } from './dto/admin.dto'
import type { TypeUserClientRes } from './types/model.types'

export class AdminModel {
	private getModelData = `
		u.id, u.first_name, u.last_name, u.email, u.phone,
		u.role, u.is_verify, u.is_active_license, u.created_at, u.updated_at,
		l.expires_license_at, l.license AS license_type
	`

	constructor(private pool: Pool, private logger: Logger) { }

	async getAllUserModel(
		limit: number,
		offset: number
	): Promise<TypeUserClientRes[]> {
		const query = `
			SELECT ${this.getModelData}
			FROM ${DB_TABLE_USERS} u
			LEFT JOIN LATERAL (
				SELECT expires_license_at, license
				FROM ${DB_TABLE_LICENSE}
				WHERE user_id = u.id
				ORDER BY created_at DESC
				LIMIT 1
			) l ON true
			ORDER BY u.created_at DESC
			LIMIT $1 OFFSET $2
		`

		const queryResult = await this.pool.query<TypeUserClientRes>(query, [
			limit,
			offset,
		])

		return queryResult.rows ?? []
	}

	async getUserByIdModel(userId: string): Promise<TypeUserClientRes | null> {
		try {
			const query = `
				SELECT ${this.getModelData}
				FROM ${DB_TABLE_USERS} u
				LEFT JOIN LATERAL (
					SELECT expires_license_at, license
					FROM ${DB_TABLE_LICENSE}
					WHERE user_id = u.id
					ORDER BY created_at DESC
					LIMIT 1
				) l ON true
				WHERE u.id = $1
			`
			const result = await this.pool.query<TypeUserClientRes>(query, [userId])

			if (!result.rows[0]) return null

			return result.rows[0]
		} catch (error) {
			const errorMessage = responseErrorDB(
				this.logger,
				error,
				'Error get one user:'
			)

			return errorMessage
		}
	}

	async editUserModel(
		userId: string,
		dto: AdminUserEditDto
	): Promise<TypeUserID | null> {
		try {
			const query = `UPDATE ${DB_TABLE_USERS} SET
			first_name = COALESCE($1, first_name), 
			last_name = COALESCE($2, last_name), 
			email = COALESCE($3, email), 
			phone = COALESCE($4, phone), 
			role = COALESCE($5, role), 
			is_verify = COALESCE($6, is_verify), 
			is_active_license = COALESCE($7, is_active_license),
			password = COALESCE($8, password)
			WHERE id = $9
			RETURNING id
			`

			const result = await this.pool.query<TypeUserID>(query, [
				dto.firstName,
				dto.lastName,
				dto.email,
				dto.phone,
				dto.role,
				dto.isVerify,
				dto.isActiveLicense,
				dto.password,
				userId,
			])

			if (!result.rows[0]?.id) return null

			return result.rows[0]
		} catch (error) {
			this.logger.error(
				'Error update user',
				error instanceof Error ? error.message : 'Internal server'
			)

			return null
		}
	}

	async removeUserModel(userId: string): Promise<IAppMessage> {
		const existingUserQuery = `SELECT id FROM ${DB_TABLE_USERS} WHERE id = $1`

		const existingUserResult = await this.pool.query<Pick<IUser, 'id'>>(
			existingUserQuery,
			[userId]
		)

		const existingUserId = existingUserResult.rows[0]?.id

		if (!existingUserId)
			return {
				message: 'Error user not founded',
			}

		const query = `DELETE FROM ${DB_TABLE_USERS} WHERE id = $1`

		await this.pool.query(query, [existingUserId])

		return { message: `User has success deleting: ${existingUserId}` }
	}
}
