import type { ISharedModelApp } from '../../../common/types/app.types'

export interface IUser extends ISharedModelApp {
	first_name: string
	last_name: string
	email: string
	phone: string
	password: string
	is_active_license: boolean
	role: number
	activation_link: string
	reset_pass_link: string
	is_verify: boolean
	enable_reset_pass: boolean
}

export type TypeUserID = Pick<IUser, 'id'>
export type TypeUserIDWithRole = Pick<IUser, 'id' | 'role'>
export type TypeUserClientRes = Omit<
	IUser,
	| 'password'
	| 'activation_link'
	| 'reset_pass_link'
	| 'enable_two_factory_challenge'
	| 'enable_reset_pass'
>

export type ReturnCreateUserType = Omit<
	IUser,
	'reset_pass_link' | 'created_at' | 'updated_at' | 'enable_reset_pass'
>
