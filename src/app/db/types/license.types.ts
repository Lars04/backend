import type { ISharedModelApp } from '../../../common/types/app.types'

export interface ILicense extends ISharedModelApp {
	user_id: string
	license: string
	expires_license_at: Date
}
