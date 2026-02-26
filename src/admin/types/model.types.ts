import type { IUser } from '../../app/db/types/user.types'

export type TypeUserClientRes = Omit<
	IUser,
	'password' | 'activation_link' | 'reset_pass_link' | 'enable_reset_pass'
> & {
	expires_license_at: Date | null
	license_type: string | null
}
