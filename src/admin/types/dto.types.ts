import { EditProfileDto } from '../../profile/types/dto.types'

export class AdminUserEditDto extends EditProfileDto {
	email: string | undefined
	role: number | undefined
	isVerify: boolean | undefined
	password: string | undefined
}
