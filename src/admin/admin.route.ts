import { Router } from 'express'
import { body } from 'express-validator'
import { ROLES } from '../app/enums'
import { authenticated } from '../auth/middleware/auth.middleware'
import { hasRole } from '../auth/middleware/hasRole.middleware'
import { adminUserController } from './index.admin'

const routerAdmin = Router({ mergeParams: true })

routerAdmin.get(
	'/users',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	adminUserController.getAllUsers.bind(adminUserController)
)
routerAdmin.get(
	'/user/:userId',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	adminUserController.getOneUser.bind(adminUserController)
)
routerAdmin.patch(
	'/user/edit/:userId',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	body('email').isEmail(),
	body('role').isInt(),
	body('isVerify').isBoolean(),
	body('isActiveLicense').isBoolean(),
	body('password').isString().isLength({ min: 3, max: 32 }),
	adminUserController.editUser.bind(adminUserController)
)
routerAdmin.delete(
	'/user/remove/:userId',
	authenticated,
	// @ts-ignore
	hasRole([ROLES.ADMIN]),
	adminUserController.deleteUser.bind(adminUserController)
)

export default routerAdmin
