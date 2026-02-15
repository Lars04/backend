import type { RequestHandler } from 'express'
import type { ROLES } from '../../app/enums'
import { logger } from '../utils/log/logger.log'

export const hasRole = (roles): RequestHandler => {
	return (req, res, next) => {
		if (!roles.includes(req.user?.role as typeof ROLES)) {
			logger.warn('Access have just Admin')
			res.status(403).send({ error: 'Access forbidden' })

			return
		}

		next()
	}
}
