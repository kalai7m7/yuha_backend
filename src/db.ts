// src/db.ts
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Kalai@30",
  database: "yuha",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
