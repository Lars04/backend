import { Router } from 'express'
import { body } from 'express-validator'
import { ROLES } from '../app/enums'
import { authenticated } from '../auth/middleware/auth.middleware'
import { hasRole } from '../auth/middleware/hasRole.middleware'
import { validateRequest } from '../common/middleware/validate.middleware'
import { licenseController } from './index.license'

const routerLicense = Router({ mergeParams: true })

routerLicense.post(
	'/add',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	body('userId')
		.trim()
		.notEmpty()
		.withMessage('ID пользователя обязателен')
		.isString(),
	body('license')
		.trim()
		.notEmpty()
		.withMessage('Лицензия обязательна')
		.isString(),
	body('expiresLicenseAt')
		.trim()
		.notEmpty()
		.withMessage('Дата истечения обязательна')
		.isISO8601(),

	validateRequest,

	licenseController.createLicense.bind(licenseController)
)
routerLicense.get(
	'/all',
	authenticated,
	// @ts-ignore
	licenseController.getAllLicense.bind(licenseController)
)
routerLicense.get(
	'/one/:licenseId',
	authenticated,
	// @ts-ignore
	licenseController.getOneLicense.bind(licenseController)
)
routerLicense.put(
	'/edit/:licenseId',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),

	body('license')
		.trim()
		.notEmpty()
		.withMessage('Лицензия обязательна')
		.isString(),

	body('expiresLicenseAt')
		.trim()
		.notEmpty()
		.withMessage('Дата истечения обязательна')
		.isISO8601(),

	validateRequest,

	licenseController.editLicense.bind(licenseController)
)
routerLicense.delete(
	'/remove/:licenseId',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	licenseController.removeLicense.bind(licenseController)
)

export default routerLicense
