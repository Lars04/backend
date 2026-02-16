export interface ISharedModelApp {
	id: string
	created_at: Date
	updated_at: Date
}

export interface IAppMessage {
	message: string
}

export interface IAppService extends IAppMessage {
	status: number
}

export type TypeAppID = Pick<ISharedModelApp, 'id'>

export interface IAppSharedDto extends TypeAppID {
	createdAt: Date
	updatedAt: Date
}

export interface IAppEnCrypto {
	encrypted: string
	iv: string
	tag: string
}

export interface IPaginationConfig {
	total: number
	limit: number
	offset: number
}

export interface IGetAllDataWithMeta<T> {
	data: T[]
	meta: IPaginationConfig
}

export interface IAppCountShared {
	count: string
}
