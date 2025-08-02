const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Item {
  static create({ listId, content, position = null }) {
    const id = uuidv4();
    
    // Si no se especifica posición, ponerlo al final
    if (position === null) {
      const maxPositionStmt = db.prepare('SELECT MAX(position) as max_pos FROM items WHERE list_id = ?');
      const result = maxPositionStmt.get(listId);
      position = (result.max_pos || 0) + 1;
    }
    
    const stmt = db.prepare(`
      INSERT INTO items (id, list_id, content, position)
      VALUES (?, ?, ?, ?)
    `);
    
    try {
      stmt.run(id, listId, JSON.stringify(content), position);
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error creating item: ${error.message}`);
    }
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
    const item = stmt.get(id);
    
    if (!item) {
      return null;
    }
    
    return {
      ...item,
      content: JSON.parse(item.content)
    };
  }

  static findByListId(listId) {
    const stmt = db.prepare(`
      SELECT * FROM items 
      WHERE list_id = ? 
      ORDER BY position ASC, created_at ASC
    `);
    
    return stmt.all(listId).map(item => ({
      ...item,
      content: JSON.parse(item.content)
    }));
  }

  static addLike(id) {
    // Primero asegurar que likes_count no es NULL
    const updateStmt = db.prepare('UPDATE items SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?');
    const result = updateStmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Item not found');
    }
    
    return this.findById(id);
  }

  static updateLikes(id, likesCount) {
    const stmt = db.prepare('UPDATE items SET likes_count = ? WHERE id = ?');
    const result = stmt.run(likesCount, id);
    
    if (result.changes === 0) {
      throw new Error('Item not found');
    }
    
    return this.findById(id);
  }

  static updatePosition(id, newPosition) {
    const stmt = db.prepare('UPDATE items SET position = ? WHERE id = ?');
    const result = stmt.run(newPosition, id);
    
    if (result.changes === 0) {
      throw new Error('Item not found');
    }
    
    return this.findById(id);
  }

  static reorderItems(listId, itemsOrder) {
    console.log('🔄 Reordering items:', { listId, itemsOrder });
    
    const transaction = db.transaction((items) => {
      for (let i = 0; i < items.length; i++) {
        const stmt = db.prepare('UPDATE items SET position = ? WHERE id = ? AND list_id = ?');
        const result = stmt.run(i + 1, items[i], listId);
        console.log(`📍 Updated item ${items[i]} to position ${i + 1}, changes: ${result.changes}`);
      }
    });
    
    transaction(itemsOrder);
    console.log('✅ Reorder completed');
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }
}

module.exports = Item;
