import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import Icons from './Icons';
import VotingButtons from './VotingButtons';

function SortableItem({ 
  id, 
  item, 
  index, 
  templateFields, 
  onLike, 
  showGoldBorder 
}) {
  const [isLiking, setIsLiking] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 🎯 MÓVIL: Solo mejorar táctil, mantener diseño original
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    if (isMobile) {
      const timer = setTimeout(() => {
        const dragHandles = document.querySelectorAll('.drag-handle');
        
        dragHandles.forEach((dragHandle) => {
          // Mantener diseño original, solo mejorar touch
          dragHandle.style.cssText = `
            padding: 8px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            background: white !important;
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: grab !important;
            touch-action: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
          `;
          
          // Ocultar emoji, mostrar SVG original
          const dragText = dragHandle.querySelector('.drag-text');
          if (dragText) {
            dragText.style.display = 'none !important';
          }
          
          const dragSvg = dragHandle.querySelector('svg');
          if (dragSvg) {
            dragSvg.style.cssText = `
              display: block !important;
              width: 16px !important;
              height: 16px !important;
              fill: #666 !important;
              pointer-events: none !important;
            `;
          }
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`https://topback.sergioromero.duckdns.org/api/items/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✨ Like añadido:', data.message);
        
        // Llamar al callback para actualizar la lista (sin hacer otro like)
        if (onLike) {
          await onLike(id, false); // false = no hacer otra petición, solo refresh
        }
      }
    } catch (error) {
      console.error('Error adding like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`modern-item-card ${isDragging ? 'dragging' : ''} ${showGoldBorder ? 'gold-border' : ''}`}
    >
      {/* Badge de "más votado" */}
      {showGoldBorder && (
        <div className="most-voted-badge">
          <Icons.Crown />
          <span>Más votado</span>
        </div>
      )}

      {/* Drag handle */}
      <div 
        className="drag-handle" 
        {...listeners} 
        {...attributes}
        role="button"
        aria-label="Arrastrar para reordenar elemento"
        tabIndex={0}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        <Icons.DragHandle />
        <span className="drag-text">≡</span>
      </div>
      
      {/* Contenido principal */}
      <div className="item-main-content">
        {templateFields.map(field => (
          <div key={field.name} className="field-row">
            <div className="field-label">{field.label}:</div>
            <div className="field-value">
              {truncateText(item.content[field.name])}
            </div>
          </div>
        ))}
        
        <div className="item-timestamp">
          {new Date(item.created_at).toLocaleString('es-ES')}
        </div>
      </div>
      
      {/* Área de votación simple */}
      <div className="voting-section">
        <button 
          onClick={handleLike}
          className={`simple-like-btn ${item.likes_count > 0 ? 'has-likes' : ''}`}
          disabled={isLiking}
          style={{
            background: isLiking ? 'var(--pico-primary-100)' : 'var(--pico-primary-500)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            cursor: isLiking ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transform: isLiking ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isLiking ? '⏳' : '👍'} 
          {item.likes_count || 0}
        </button>
      </div>
    </div>
  );
}

export default SortableItem;
