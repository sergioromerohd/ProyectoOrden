const express = require('express');
const router = express.Router();
const List = require('../models/List');

// POST /api/lists - Crear nueva lista
router.post('/', (req, res) => {
  try {
    const { title, description, templateFields } = req.body;
    
    // Validaciones básicas
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }
    
    if (!templateFields || !Array.isArray(templateFields) || templateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Template fields are required and must be a non-empty array' 
      });
    }
    
    // Validar estructura de templateFields
    const isValidTemplate = templateFields.every(field => 
      field.name && 
      field.label && 
      field.type &&
      typeof field.required === 'boolean'
    );
    
    if (!isValidTemplate) {
      return res.status(400).json({ 
        error: 'Invalid template fields structure' 
      });
    }
    
    const list = List.create({
      title: title.trim(),
      description: description?.trim() || '',
      templateFields
    });
    
    res.status(201).json({
      success: true,
      data: list
    });
    
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET /api/lists/:id - Obtener lista con sus items
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const list = List.findByIdWithItems(id);
    
    if (!list) {
      return res.status(404).json({ 
        error: 'List not found' 
      });
    }
    
    res.json({
      success: true,
      data: list
    });
    
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
