const db = require('./database');
const fs = require('fs');
const path = require('path');

function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Crear tabla de listas
    db.exec(`
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        template_fields TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de items
    db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de votos para tracking avanzado
    db.exec(`
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        voter_id TEXT NOT NULL,
        vote_type TEXT NOT NULL DEFAULT 'like',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
        UNIQUE(item_id, voter_id)
      )
    `);

    // Crear índices para mejor performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_items_list_id ON items(list_id);
      CREATE INDEX IF NOT EXISTS idx_items_position ON items(list_id, position);
      CREATE INDEX IF NOT EXISTS idx_items_likes ON items(likes_count);
      CREATE INDEX IF NOT EXISTS idx_votes_item_id ON votes(item_id);
      CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
    `);

    console.log('✅ Database initialized successfully!');
    
    // Verificar que las tablas se crearon
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📋 Tables created:', tables.map(t => t.name).join(', '));
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Crear directorio de database si no existe
const dbDir = path.dirname(require.resolve('./database'));
const databaseDir = path.resolve(dbDir, '../../database');
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
  process.exit(0);
}

module.exports = initDatabase;
