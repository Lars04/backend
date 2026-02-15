import bcrypt from 'bcrypt'
import type { Pool } from 'pg'
import type { ISession } from '../../app/db/types/session.types'
import { DB_TABLE_SESSIONS } from '../../common/constants/db.constants'
import type { ExistTokenType } from '../types/token.type'

export class SessionModel {
	constructor(private pool: Pool) {}

	async create(
		userId: string,
		refreshToken: string,
		expires_token_at: Date
	): Promise<ISession | null> {
		const query = `
				INSERT INTO ${DB_TABLE_SESSIONS} 
				(user_id, refresh_token, expires_token_at) 
				VALUES ($1, $2, $3) 
				ON CONFLICT (user_id)
				DO UPDATE SET 
				refresh_token = EXCLUDED.refresh_token, 
				expires_token_at = EXCLUDED.expires_token_at,
				RETURNING *
			`

		const queryResult = await this.pool.query<ISession>(query, [
			userId,
			refreshToken,
			expires_token_at,
		])

		return queryResult.rows[0] ?? null
	}

	async findOne(
		userId: string
	): Promise<Omit<ISession, 'user_id' | 'created_at' | 'updated_at'> | null> {
		const query = `
		SELECT id, refresh_token, expires_token_at 
		FROM ${DB_TABLE_SESSIONS} WHERE user_id = $1`
		const queryResult = await this.pool.query<
			Omit<ISession, 'user_id' | 'created_at' | 'updated_at'>
		>(query, [userId])

		return queryResult.rows[0] ?? null
	}

	async save(
		userId: string,
		existsToken: ExistTokenType,
		oldRefresh: string,
		newRefresh: string,
		expireToken: Date
	): Promise<ISession | null> {
		try {
			if (existsToken) {
				const isMatch = await bcrypt.compare(
					oldRefresh,
					existsToken.refresh_token
				)

				if (isMatch) {
					const queryRemove = `DELETE FROM ${DB_TABLE_SESSIONS} WHERE user_id = $1`

					await this.pool.query(queryRemove, [userId])
				}
			}

			const queryCreate = `
				INSERT INTO ${DB_TABLE_SESSIONS} 
				(user_id, refresh_token, expires_token_at) 
				VALUES ($1, $2, $3) 
				ON CONFLICT (user_id)
				DO UPDATE SET 
				refresh_token = EXCLUDED.refresh_token, 
				expires_token_at = EXCLUDED.expires_token_at
				RETURNING *
			`
			const queryCreateResult = await this.pool.query<ISession>(queryCreate, [
				userId,
				newRefresh,
				expireToken,
			])

			const newSession = queryCreateResult.rows[0]

			if (!newSession) {
				return null
			}

			return newSession
		} catch (error) {
			return null
		}
	}

	async delete(
		userId: string,
		refreshToken: string
	): Promise<Pick<ISession, 'id' | 'refresh_token'> | null> {
		const query = `SELECT id, refresh_token FROM ${DB_TABLE_SESSIONS} WHERE user_id = $1`
		const queryResult = await this.pool.query<
			Pick<ISession, 'id' | 'refresh_token'>
		>(query, [userId])

		for (const row of queryResult.rows) {
			const isMatch = await bcrypt.compare(refreshToken, row.refresh_token)

			if (isMatch) {
				const queryRemove = `DELETE FROM ${DB_TABLE_SESSIONS} WHERE user_id = $1`

				await this.pool.query(queryRemove, [userId])

				return { id: row.id, refresh_token: row.refresh_token }
			}
		}

		return null
	}
}
