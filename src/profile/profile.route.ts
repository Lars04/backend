import { Router } from 'express'
import { body } from 'express-validator'
import { authenticated } from '../auth/middleware/auth.middleware'
import { profileController } from './index.profile'

const routerProfile = Router({ mergeParams: true })

routerProfile.get(
	'/me',
	authenticated,
	// @ts-ignore
	profileController.findProfileMe.bind(profileController)
)
routerProfile.patch(
	'/edit/me',
	authenticated,
	body('firstName').isString().isLength({ min: 3, max: 32 }),
	body('lastName').isString().isLength({ min: 3, max: 32 }),
	body('phone').isString().isMobilePhone(['tk-TM', 'ru-RU']),
	// @ts-ignore
	profileController.editProfileMe.bind(profileController)
)

export default routerProfile
