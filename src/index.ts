import dotenv from 'dotenv'
import express from 'express'
import { checkDB } from './app/check-db.app'
import { initDB } from './app/db/init-db.app'
import router from './app/router.app'
import { APP_CONFIG } from './common/config/app.config'
import { defaultMiddleware } from './common/middleware/appMiddleware.middleware'
import { errorMiddleware } from './common/middleware/error-middleware.middleware'
import { logger } from './common/utils/log/logger.log'

dotenv.config({ path: '../.env' })

const app = express()
const port = APP_CONFIG.PORT

// Middleware
defaultMiddleware(app, express)

// Index Router
app.use('/api', router)

app.use(errorMiddleware)

const startApp = async (): Promise<void> => {
	try {
		// Проверка подключение к базе данных
		await checkDB()
		await initDB()

		// Запуск сервера
		app.listen(port, () => {
			logger.info(`🚀 Сервер запущен на http://localhost:${port}`)
		})
	} catch (error) {
		logger.error(`❌ Ошибка запуска сервера: ${error}`)
		process.exit(1)
	}
}

startApp()
