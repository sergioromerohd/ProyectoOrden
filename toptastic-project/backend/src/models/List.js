const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class List {
  static create({ title, description = '', templateFields }) {
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO lists (id, title, description, template_fields)
      VALUES (?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(id, title, description, JSON.stringify(templateFields));
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error creating list: ${error.message}`);
    }
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM lists WHERE id = ?');
    const list = stmt.get(id);
    
    if (!list) {
      return null;
    }
    
    // Parse template_fields JSON
    return {
      ...list,
      template_fields: JSON.parse(list.template_fields)
    };
  }

  static findByIdWithItems(id) {
    const list = this.findById(id);
    if (!list) {
      return null;
    }

    // Obtener items ordenados por posición
    const itemsStmt = db.prepare(`
      SELECT * FROM items 
      WHERE list_id = ? 
      ORDER BY position ASC, created_at ASC
    `);
    
    const items = itemsStmt.all(id).map(item => ({
      ...item,
      content: JSON.parse(item.content)
    }));

    return {
      ...list,
      items
    };
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM lists ORDER BY created_at DESC');
    return stmt.all().map(list => ({
      ...list,
      template_fields: JSON.parse(list.template_fields)
    }));
  }
}

module.exports = List;
