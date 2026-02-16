import type { Response } from 'express'
import type { Logger } from 'winston'
import type { IRequestUserApp } from '../auth/types/token.type'
import { responseInternalServer } from '../common/utils/app/errorResponse.utils'
import type { LicenseService } from './license.service'

export class LicenseController {
	constructor(private service: LicenseService, private logger: Logger) {}

	async createLicense(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const body = req.body
			const newLicense = await this.service.addLicense(body)

			if ('status' in newLicense) {
				res.status(newLicense.status).json({ message: newLicense.message })

				return
			}

			res.status(201).json(newLicense)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from create license controller',
				this.logger
			)
		}
	}

	async getAllLicense(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const userId = req.user?.sub
			const userRole = req.user?.role
			const page = Number(req.query.page) || 1
			const limit = Number(req.query.limit) || 10
			const offset = (page - 1) * limit
			const resultAllLicense = await this.service.findAllLicense(
				userId,
				userRole,
				limit,
				offset
			)

			if ('message' in resultAllLicense) {
				res
					.status(resultAllLicense.status)
					.json({ message: resultAllLicense.message })

				return
			}

			res.status(200).json(resultAllLicense)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get-all license controller',
				this.logger
			)
		}
	}

	async getOneLicense(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const userId = req.user?.sub
			const userRole = req.user?.role
			const { licenseId } = req.params
			const licenseResult = await this.service.findOneLicense(
				licenseId,
				userId,
				userRole
			)

			if ('message' in licenseResult) {
				res
					.status(licenseResult.status)
					.json({ message: licenseResult.message })

				return
			}

			res.status(200).json(licenseResult)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from get-one license controller',
				this.logger
			)
		}
	}

	async editLicense(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const { licenseId } = req.params
			const updateLicense = await this.service.updateLicense(
				licenseId,
				req.body
			)

			if ('status' in updateLicense) {
				res
					.status(updateLicense.status)
					.json({ message: updateLicense.message })

				return
			}

			res.status(201).json(updateLicense)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from edit license controller',
				this.logger
			)
		}
	}

	async removeLicense(req: IRequestUserApp, res: Response): Promise<void> {
		try {
			const { licenseId } = req.params
			const license = await this.service.deleteLicense(licenseId)

			if ('status' in license) {
				res.status(license.status).json({ message: license.message })

				return
			}

			res.status(200).json(license)
		} catch (error) {
			await responseInternalServer(
				error,
				res,
				'Internal-server from delete-license controller',
				this.logger
			)
		}
	}
}
