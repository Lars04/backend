import type { IAppSharedDto } from '../../common/types/app.types'

export interface ILicenseDto extends IAppSharedDto {
	userId: string
	license: string
	expiresLicenseAt: string
	expiresLicenseIv: string
	expiresLicenseTag: string
}
