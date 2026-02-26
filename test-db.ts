import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
})

async function check() {
    const users = await pool.query('SELECT id, email FROM users')
    console.log('Users:', users.rows)
    const licenses = await pool.query('SELECT * FROM license')
    console.log('Licenses:', licenses.rows)
    pool.end()
}
check()
