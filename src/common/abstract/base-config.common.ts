import { APP_EXPIRES_CONFIG, APP_SESSIONS_CONFIG } from '../config/app.config'
import { writeHeadData } from '../utils/app/writeHeadData.utils'

export abstract class BaseConfig {
	// Config ===============================
	protected expireVerifyUserConfig = APP_EXPIRES_CONFIG.EXPIRES_USER_VERIFY
	protected expireVerifyUserRemove =
		APP_EXPIRES_CONFIG.EXPIRES_USER_REMOVE_VERIFY
	protected expireVerifyUserResetPassword =
		APP_EXPIRES_CONFIG.EXPIRES_USER_RESET_PASSWORD_VERIFY
	protected expireVerifyUserUnityCaseConfig =
		APP_EXPIRES_CONFIG.EXPIRES_USER_VERIFY_UNIT_CASE
	protected expireVerifyUserRemoveUnityCaseConfig =
		APP_EXPIRES_CONFIG.EXPIRES_USER_REMOVE_VERIFY_UNIT_CASE
	protected expireVerifyUserResetPasswordUnityCaseConfig =
		APP_EXPIRES_CONFIG.EXPIRES_USER_RESET_PASSWORD_VERIFY_UNIT_CASE
	// Keys ===============================
	protected accessSecretKey = APP_SESSIONS_CONFIG.JWT_ACCESS_KEY
	protected refreshSecretKey = APP_SESSIONS_CONFIG.JWT_REFRESH_KEY
	// Expire ===============================
	protected accessExpire = APP_SESSIONS_CONFIG.JWT_ACCESS_EXPIRES
	protected refreshExpire = APP_SESSIONS_CONFIG.JWT_REFRESH_EXPIRES
	protected accessExpireUnitCase =
		APP_SESSIONS_CONFIG.JWT_ACCESS_EXPIRES_UNIT_CASE
	protected refreshExpireUnitCase =
		APP_SESSIONS_CONFIG.JWT_REFRESH_EXPIRES_UNIT_CASE
	protected expiresVerify: Date | null = null
	protected expiresRemoveVerify: Date | null = null
	protected expiresRemoveRefresh = new Date(0).toUTCString()
	// Flags ===============================
	protected isFirstSendEmailVerifyAccount: boolean = true
	protected isFirstSendEmailForgetPassword: boolean = true
	protected isFirstVerifyForgetPassword: boolean = true
	// Message ===============================
	protected expireMessage: string = `Please confirm your account verify the link, you have ${this.expireVerifyUserConfig}${this.expireVerifyUserUnityCaseConfig} to do this.`
	protected errorExpireMessage: string =
		'Unfortunately, your confirmation time has expired, Do you wants again send email if you not verify time has 1 hour. Please register again.'
	protected errorAgainExpireMessage: string =
		'Unfortunately, your confirmation time has expired, please register again.'
	// Utils =============================
	protected headData = writeHeadData(400)
}
