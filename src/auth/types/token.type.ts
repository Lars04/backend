import type { Request } from 'express'
import type { JwtPayload } from 'jsonwebtoken'
import type { ISession } from '../../app/db/types/session.types'

export type ExistTokenType = Omit<
	ISession,
	'user_id' | 'created_at' | 'updated_at'
> | null

export interface IAccessTokenService {
	access: string
	refresh: string
}

export type TokenReturningType = Pick<ISession, 'id' | 'refresh_token'> | null

export interface IUserJwtPayload extends JwtPayload {
	role: number | undefined
	type: string
}

export type ValidateTokenType = string | null | JwtPayload | IUserJwtPayload

export interface IRequestUserApp extends Request {
	user: IUserJwtPayload | undefined | null
}
