const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const List = require('../models/List');
const Vote = require('../models/Vote');

// POST /api/lists/:id/items - Añadir item a una lista
router.post('/:listId/items', (req, res) => {
  try {
    const { listId } = req.params;
    const { content } = req.body;
    
    // Verificar que la lista existe
    const list = List.findById(listId);
    if (!list) {
      return res.status(404).json({ 
        error: 'List not found' 
      });
    }
    
    // Validar contenido
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ 
        error: 'Content is required and must be an object' 
      });
    }
    
    // Validar que el contenido coincida con el template
    const requiredFields = list.template_fields
      .filter(field => field.required)
      .map(field => field.name);
    
    const missingFields = requiredFields.filter(field => !content[field] || !content[field].toString().trim());
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const item = Item.create({
      listId,
      content
    });
    
    res.status(201).json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST /api/items/:itemId/like - Ruta simple para dar like (sin restricciones)
router.post('/:itemId/like', (req, res) => {
  try {
    const { itemId } = req.params;
    
    console.log(`🚀 Like request received for item: ${itemId}`);
    
    // Verificar que el item existe
    const item = Item.findById(itemId);
    if (!item) {
      console.log(`❌ Item ${itemId} not found`);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Incrementar likes usando el método addLike que ya existe
    const updatedItem = Item.addLike(itemId);
    
    console.log(`✨ Item ${itemId} got a like! Total likes: ${updatedItem.likes_count}`);
    
    res.json({
      success: true,
      likes: updatedItem.likes_count,
      message: '¡Like añadido! 🎉',
      item: updatedItem
    });
    
  } catch (error) {
    console.error('❌ Error adding like:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

router.post('/:itemId/vote', (req, res) => {
  try {
    const { itemId } = req.params;
    const { voteType = 'like', voterId } = req.body;
    
    // Generar un ID de votante si no se proporciona (para usuarios anónimos)
    const actualVoterId = voterId || req.ip || `anonymous_${Date.now()}_${Math.random()}`;
    
    if (!['like', 'dislike'].includes(voteType)) {
      return res.status(400).json({ 
        error: 'Vote type must be "like" or "dislike"' 
      });
    }
    
    const vote = Vote.create({
      itemId,
      voterId: actualVoterId,
      voteType
    });
    
    // Obtener estadísticas actualizadas del item
    const stats = Vote.getItemStats(itemId);
    
    res.json({
      success: true,
      data: {
        vote,
        stats
      }
    });
    
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found' 
      });
    }
    
    console.error('Error voting for item:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// DELETE /api/items/:itemId/vote - Quitar voto de un item
router.delete('/:itemId/vote', (req, res) => {
  try {
    const { itemId } = req.params;
    const { voterId } = req.body;
    
    const actualVoterId = voterId || req.ip || `anonymous_${Date.now()}`;
    
    const removed = Vote.remove(itemId, actualVoterId);
    
    if (!removed) {
      return res.status(404).json({ 
        error: 'Vote not found' 
      });
    }
    
    // Obtener estadísticas actualizadas del item
    const stats = Vote.getItemStats(itemId);
    
    res.json({
      success: true,
      message: 'Vote removed successfully',
      data: { stats }
    });
    
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PATCH /api/items/:itemId/like - ELIMINADO: ahora usamos POST /like
// router.patch('/:itemId/like', ...)

// GET /api/items/:itemId/stats - Obtener estadísticas de un item
router.get('/:itemId/stats', (req, res) => {
  try {
    const { itemId } = req.params;
    
    const stats = Vote.getItemStats(itemId);
    const votes = Vote.findByItem(itemId);
    
    res.json({
      success: true,
      data: {
        stats,
        recent_votes: votes.slice(0, 10) // Últimos 10 votos
      }
    });
    
  } catch (error) {
    console.error('Error getting item stats:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET /api/lists/:listId/top-voted - Obtener items más votados
router.get('/:listId/top-voted', (req, res) => {
  try {
    const { listId } = req.params;
    const { limit = 10 } = req.query;
    
    const topItems = Vote.getTopVotedItems(listId, parseInt(limit));
    
    res.json({
      success: true,
      data: topItems
    });
    
  } catch (error) {
    console.error('Error getting top voted items:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET /api/lists/:listId/voting-activity - Obtener actividad de votación reciente
router.get('/:listId/voting-activity', (req, res) => {
  try {
    const { listId } = req.params;
    const { hours = 24 } = req.query;
    
    const activity = Vote.getVotingActivity(listId, parseInt(hours));
    
    res.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    console.error('Error getting voting activity:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PATCH /api/items/:itemId/position - Actualizar posición
router.patch('/:itemId/position', (req, res) => {
  try {
    const { itemId } = req.params;
    const { position } = req.body;
    
    if (typeof position !== 'number' || position < 1) {
      return res.status(400).json({ 
        error: 'Position must be a positive number' 
      });
    }
    
    const item = Item.updatePosition(itemId, position);
    
    res.json({
      success: true,
      data: item
    });
    
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Item not found' 
      });
    }
    
    console.error('Error updating position:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PUT /api/lists/:listId/items/reorder - Reordenar todos los items
router.put('/:listId/items/reorder', (req, res) => {
  try {
    const { listId } = req.params;
    const { itemsOrder } = req.body;
    
    // Verificar que la lista existe
    const list = List.findById(listId);
    if (!list) {
      return res.status(404).json({ 
        error: 'List not found' 
      });
    }
    
    if (!Array.isArray(itemsOrder)) {
      return res.status(400).json({ 
        error: 'itemsOrder must be an array' 
      });
    }
    
    Item.reorderItems(listId, itemsOrder);
    
    res.json({
      success: true,
      message: 'Items reordered successfully'
    });
    
  } catch (error) {
    console.error('Error reordering items:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
