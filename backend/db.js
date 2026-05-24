const { Pool } = require('pg');

const isLocal = process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1')
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )
`, (err) => {
    if (err) {
        console.error('Error al crear tabla users:', err.message);
    } else {
        console.log('Tabla users lista en PostgreSQL');
    }
});

module.exports = pool;
