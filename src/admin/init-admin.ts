import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import type { TypeUserID } from '../app/db/types/user.types'
import { ROLES } from '../app/enums'
import { authModel } from '../auth/index.auth'
import type { RegistrationDto } from '../auth/types/dto.types'
import { genLinks } from '../common/constants/link.constant'
import type { IAppMessage } from '../common/types/app.types'

export const initAdmin = async (
	adminEmail: string,
	adminPhone: string,
	isVerifyAdmin: boolean,
	adminPass: string
): Promise<TypeUserID | IAppMessage> => {
	const existingAdmin = await authModel.getUserByEmail(adminEmail)

	if (!existingAdmin) {
		const hasPass = await bcrypt.hash(adminPass, 10)
		const { activationLink, resetPassLink } = genLinks(uuidV4)
		const data: RegistrationDto = {
			firstName: 'admin',
			lastName: 'rejep',
			email: adminEmail,
			phone: adminPhone,
			password: hasPass,
		}
		const newAdmin = await authModel.createAdminUserModel(
			data,
			activationLink,
			resetPassLink,
			isVerifyAdmin,
			ROLES.ADMIN
		)

		if (!newAdmin) {
			return {
				message: 'Error admin is not created from init-app!',
			}
		}

		return newAdmin
	}

	return existingAdmin
}
