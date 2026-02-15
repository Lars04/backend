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
