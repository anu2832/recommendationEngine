import mysql from 'mysql2/promise';

// Database configuration object
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'ITT12345',
    database: 'Recommendation',
};
// Creating a pool connection
export const pool = mysql.createPool(dbConfig);
