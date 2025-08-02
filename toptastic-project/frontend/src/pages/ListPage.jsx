import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import SortableItemsList from '../components/SortableItemsList';
import VotingStats from '../components/VotingStats';
import Icons from '../components/Icons';

function ListPage() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [statsRefresh, setStatsRefresh] = useState(0);

  useEffect(() => {
    loadList();
  }, [id]);

  const loadList = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.getList(id);
      if (response.success) {
        setList(response.data);
        // Inicializar nuevo item con campos vacíos
        const initialItem = {};
        response.data.template_fields.forEach(field => {
          initialItem[field.name] = '';
        });
        setNewItem(initialItem);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewItemChange = (fieldName, value) => {
    setNewItem(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddingItem(true);

    try {
      // Validar campos requeridos
      const requiredFields = list.template_fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        !newItem[field.name] || !newItem[field.name].toString().trim()
      );

      if (missingFields.length > 0) {
        throw new Error(`Faltan campos obligatorios: ${missingFields.map(f => f.label).join(', ')}`);
      }

      const response = await api.addItem(id, { content: newItem });
      
      if (response.success) {
        // Recargar la lista para mostrar el nuevo item
        await loadList();
        
        // Limpiar formulario
        const cleanItem = {};
        list.template_fields.forEach(field => {
          cleanItem[field.name] = '';
        });
        setNewItem(cleanItem);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingItem(false);
    }
  };

  const handleLike = async (itemId, shouldMakeLikeRequest = true) => {
    try {
      // Solo hacer la petición si se especifica (para evitar dobles calls)
      if (shouldMakeLikeRequest) {
        await api.likeItem(itemId);
      }
      
      // Siempre recargar lista para actualizar el contador
      await loadList();
      // Refresh stats
      setStatsRefresh(prev => prev + 1);
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleReorder = async (newItemsOrder) => {
    try {
      await api.reorderItems(id, newItemsOrder);
      // Recargar la lista para mostrar el nuevo orden
      await loadList();
    } catch (err) {
      console.error('Error al reordenar items:', err);
      // Recargar para restaurar el orden original en caso de error
      await loadList();
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // Podrías añadir un toast aquí
    alert('¡Enlace copiado! Compártelo con tus amigos');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Cargando lista...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container">
        <div className="error">
          <h2>Lista no encontrada</h2>
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--pico-muted-color)' }}>
          ← Crear nueva lista
        </Link>
        
        <div className="header">
          <h1 className="gradient-text">{list.title}</h1>
          {list.description && <p>{list.description}</p>}
          
          <div style={{ marginTop: '1rem' }}>
            <button onClick={copyShareLink} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Share />
              Copiar enlace para compartir
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Formulario para añadir nuevo item */}
        <section className="add-item-form" style={{ marginBottom: '3rem', padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Add />
            Añadir elemento
          </h3>
          
          <form onSubmit={handleAddItem}>
            <div className="form-grid">
              {list.template_fields.map(field => (
                <div key={field.name} className="form-field">
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span style={{ color: 'var(--pico-del-color)' }}> *</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={newItem[field.name] || ''}
                      onChange={(e) => handleNewItemChange(field.name, e.target.value)}
                      required={field.required}
                      rows="3"
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      value={newItem[field.name] || ''}
                      onChange={(e) => handleNewItemChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="error" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={addingItem}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {addingItem ? '⏳ Añadiendo...' : (
                  <>
                    <Icons.Add />
                    Añadir elemento
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Lista de items */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            
            {list.items && list.items.length > 0 && (
              <small className="help-text">
                Arrastra los elementos para reordenar
              </small>
            )}
          </div>
          
          {(!list.items || list.items.length === 0) ? (
            <div className="empty-state">
              <p>🎯 Aún no hay elementos en esta lista.</p>
              <p>¡Sé el primero en añadir uno!</p>
            </div>
          ) : (
            <SortableItemsList
              items={list.items}
              templateFields={list.template_fields}
              onLike={handleLike}
              onReorder={handleReorder}
            />
          )}
        </section>

        {/* Estadísticas de votación (Hito 5) */}
        {list.items && list.items.length > 0 && (
          <VotingStats 
            listId={id} 
            refreshTrigger={statsRefresh}
          />
        )}
      </main>
    </div>
  );
}

export default ListPage;
