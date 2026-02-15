export class LoginDto {
	email: string | undefined
	password: string | undefined
	phone?: string | undefined
}

export class RegistrationDto {
	firstName: string | undefined
	email: string | undefined
	phone: string | undefined
	password: string | undefined
	lastName?: string | undefined
}

export class RepaidVerifyDto {
	email: string | undefined
}

export class ForgetDto implements RepaidVerifyDto {
	resetLink: string | undefined
	isEnableResetPass: boolean | undefined
	newPassword: string | undefined
	email: string | undefined
}
