import { Router } from 'express'
import routerAdmin from '../admin/admin.route'
import routerAuth from '../auth/auth.route'
import routerLicense from '../license/license.route'
import routerProfile from '../profile/profile.route'

const router = Router({ mergeParams: true })

router.use('/auth', routerAuth)
router.use('/profile', routerProfile)
router.use('/admin', routerAdmin)
router.use('/license', routerLicense)

export default router
