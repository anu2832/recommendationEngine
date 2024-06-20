import mysql from 'mysql2/promise';
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'ITT12345',
    database: 'Recommendation'
};
export const pool = mysql.createPool(dbConfig);