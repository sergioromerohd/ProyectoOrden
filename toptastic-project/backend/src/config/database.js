const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database/database.db';
const fullDbPath = path.resolve(__dirname, '../../', dbPath);

// Crear la conexión a la base de datos
const db = new Database(fullDbPath);

// Configurar para mejor performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

module.exports = db;
