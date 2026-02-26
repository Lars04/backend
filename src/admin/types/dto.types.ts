import type { IUserDto } from '../../auth/dto/user.dto'

export type TypeAdminUserDto = Omit<
	IUserDto,
	'enableResetPass' | 'enableTwoFactoryChallenge'
> & {
	expiresLicenseAt: Date | null
	licenseType: string | null
}
