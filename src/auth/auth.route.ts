import { Router } from 'express'
import { body } from 'express-validator'
import { authController } from './index.auth'

const routerAuth = Router({ mergeParams: true })

routerAuth.post(
	'/registration',
	body('email').isEmail(),
	body('password').isString().isLength({ min: 3, max: 32 }),
	authController.registration.bind(authController)
)
routerAuth.post(
	'/login',
	body('email'),
	body('password'),
	authController.login.bind(authController)
)
routerAuth.get(
	'/activate/:link',
	authController.verifyAccount.bind(authController)
)
routerAuth.post('/refresh', authController.refresh.bind(authController))
routerAuth.post('/logout', authController.logout.bind(authController))
routerAuth.post('/repaid/activate', authController.getLink.bind(authController))
// Forget
routerAuth.post(
	'/forget/activate',
	body('email').isEmail(),
	authController.getForgetLink.bind(authController)
)
routerAuth.get(
	'/forget/activate/:link',
	authController.verifyForgetPassword.bind(authController)
)
routerAuth.post(
	'/forget/new',
	body('email').isEmail(),
	body('newPassword').isString().isLength({ min: 3, max: 32 }),
	authController.newPassword.bind(authController)
)

export default routerAuth
