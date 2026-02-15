import type { IncomingMessage } from 'http'
import type {
	IRequestUserApp,
	IUserJwtPayload,
} from '../../../auth/types/token.type'

export const isRequestUserDataApp = (obj: unknown): obj is IUserJwtPayload =>
	typeof obj === 'object' &&
	obj !== null &&
	'sub' in obj &&
	typeof obj.sub === 'string' &&
	'role' in obj &&
	typeof obj.role !== 'undefined'

export const isRequestUserApp = (
	req: IncomingMessage | IRequestUserApp
): req is IRequestUserApp =>
	!!req && typeof req === 'object' && 'headers' in req
