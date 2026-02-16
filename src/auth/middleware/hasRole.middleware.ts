import type { NextFunction, Response } from 'express'
import { logger } from '../../common/utils/log/logger.log'
import type { IRequestUserApp } from '../types/token.type'

export const hasRole = (roles: [number]) => {
	return (req: IRequestUserApp, res: Response, next: NextFunction) => {
		if (req.user?.role && !roles.includes(req.user.role)) {
			logger.warn('Access have just Admin')
			res.status(403).send({ error: 'Access forbidden' })

			return
		}

		next()
	}
}
