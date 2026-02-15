import type { ISharedModelApp } from '../../../common/types/app.types'

export interface ISession extends ISharedModelApp {
	user_id: string
	refresh_token: string
	expires_token_at: Date
	expires_forget_pass_at: Date
	created_at: Date
	updated_at: Date
}
