import { Router } from 'express'
import routerAuth from '../auth/auth.route'
import routerLicense from '../license/license.route'
import routerProfile from '../profile/profile.route'

const router = Router({ mergeParams: true })

router.use('/auth', routerAuth)
router.use('/profile', routerProfile)
router.use('/license', routerLicense)
// router.use('/admin')

export default router
