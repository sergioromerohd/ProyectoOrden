const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Vote {
  static create({ itemId, voterId, voteType = 'like' }) {
    const id = uuidv4();
    
    // Usar transaction para mantener consistencia
    const transaction = db.transaction(() => {
      // Verificar si ya existe un voto de este usuario para este item
      const existingVote = db.prepare('SELECT id FROM votes WHERE item_id = ? AND voter_id = ?').get(itemId, voterId);
      
      if (existingVote) {
        // Si ya votó, actualizamos el voto
        const updateStmt = db.prepare('UPDATE votes SET vote_type = ?, created_at = CURRENT_TIMESTAMP WHERE item_id = ? AND voter_id = ?');
        updateStmt.run(voteType, itemId, voterId);
      } else {
        // Si no ha votado, creamos nuevo voto
        const insertStmt = db.prepare(`
          INSERT INTO votes (id, item_id, voter_id, vote_type)
          VALUES (?, ?, ?, ?)
        `);
        insertStmt.run(id, itemId, voterId, voteType);
      }
      
      // Actualizar contador en la tabla items
      this.updateItemLikesCount(itemId);
    });
    
    transaction();
    
    return this.findByItemAndVoter(itemId, voterId);
  }
  
  static remove(itemId, voterId) {
    const transaction = db.transaction(() => {
      // Eliminar el voto
      const deleteStmt = db.prepare('DELETE FROM votes WHERE item_id = ? AND voter_id = ?');
      const result = deleteStmt.run(itemId, voterId);
      
      if (result.changes > 0) {
        // Actualizar contador en la tabla items
        this.updateItemLikesCount(itemId);
      }
      
      return result.changes > 0;
    });
    
    return transaction();
  }
  
  static findByItemAndVoter(itemId, voterId) {
    const stmt = db.prepare('SELECT * FROM votes WHERE item_id = ? AND voter_id = ?');
    return stmt.get(itemId, voterId);
  }
  
  static findByItem(itemId) {
    const stmt = db.prepare(`
      SELECT * FROM votes 
      WHERE item_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(itemId);
  }
  
  static getItemStats(itemId) {
    const stmt = db.prepare(`
      SELECT 
        vote_type,
        COUNT(*) as count,
        MAX(created_at) as last_vote_at
      FROM votes 
      WHERE item_id = ? 
      GROUP BY vote_type
    `);
    
    const results = stmt.all(itemId);
    
    return {
      likes: results.find(r => r.vote_type === 'like')?.count || 0,
      dislikes: results.find(r => r.vote_type === 'dislike')?.count || 0,
      total_votes: results.reduce((sum, r) => sum + r.count, 0),
      last_vote_at: results.length > 0 ? Math.max(...results.map(r => new Date(r.last_vote_at).getTime())) : null
    };
  }
  
  static updateItemLikesCount(itemId) {
    // Contar solo los likes (no dislikes)
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM votes WHERE item_id = ? AND vote_type = ?');
    const { count } = countStmt.get(itemId, 'like');
    
    // Actualizar el contador en la tabla items (sin updated_at por ahora)
    const updateStmt = db.prepare('UPDATE items SET likes_count = ? WHERE id = ?');
    updateStmt.run(count, itemId);
    
    return count;
  }
  
  static getTopVotedItems(listId, limit = 10) {
    const stmt = db.prepare(`
      SELECT 
        i.*,
        COALESCE(v.like_count, 0) as like_count,
        COALESCE(v.dislike_count, 0) as dislike_count,
        COALESCE(v.total_votes, 0) as total_votes,
        v.last_vote_at
      FROM items i
      LEFT JOIN (
        SELECT 
          item_id,
          SUM(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) as like_count,
          SUM(CASE WHEN vote_type = 'dislike' THEN 1 ELSE 0 END) as dislike_count,
          COUNT(*) as total_votes,
          MAX(created_at) as last_vote_at
        FROM votes 
        GROUP BY item_id
      ) v ON i.id = v.item_id
      WHERE i.list_id = ?
      ORDER BY like_count DESC, last_vote_at DESC
      LIMIT ?
    `);
    
    return stmt.all(listId, limit);
  }
  
  static getVotingActivity(listId, hours = 24) {
    const stmt = db.prepare(`
      SELECT 
        v.*,
        i.content,
        datetime(v.created_at) as vote_time
      FROM votes v
      JOIN items i ON v.item_id = i.id
      WHERE i.list_id = ? 
        AND v.created_at >= datetime('now', '-${hours} hours')
      ORDER BY v.created_at DESC
    `);
    
    return stmt.all(listId);
  }
}

module.exports = Vote;
