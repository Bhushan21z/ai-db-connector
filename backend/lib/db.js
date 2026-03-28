import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'db_speaks_ai',
});

// Helper to run queries
export const query = (text, params) => pool.query(text, params);

export default pool;
