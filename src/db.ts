// src/db.ts
import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // required for Supabase
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

db.connect()
  .then(client => {
    console.log('✅ DB connected');
    client.release();
  })
  .catch(err => console.error('❌ DB connection error:', err));
