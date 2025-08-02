import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [listData, setListData] = useState({
    title: '',
    description: '',
    templateFields: [
      { name: 'field1', label: 'Campo 1', type: 'text', required: true }
    ]
  });

  const handleTitleChange = (e) => {
    setListData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleDescriptionChange = (e) => {
    setListData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleFieldChange = (index, field, value) => {
    setListData(prev => ({
      ...prev,
      templateFields: prev.templateFields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }));
  };

  const addField = () => {
    setListData(prev => ({
      ...prev,
      templateFields: [
        ...prev.templateFields,
        { 
          name: `field${prev.templateFields.length + 1}`, 
          label: `Campo ${prev.templateFields.length + 1}`, 
          type: 'text', 
          required: false 
        }
      ]
    }));
  };

  const removeField = (index) => {
    if (listData.templateFields.length > 1) {
      setListData(prev => ({
        ...prev,
        templateFields: prev.templateFields.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos
      if (!listData.title.trim()) {
        throw new Error('El título es obligatorio');
      }

      if (listData.templateFields.some(field => !field.label.trim())) {
        throw new Error('Todos los campos deben tener una etiqueta');
      }

      // Generar nombres únicos para los campos basados en las etiquetas
      const processedFields = listData.templateFields.map((field, index) => ({
        ...field,
        name: field.label.toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/[ñ]/g, 'n')
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '') || `field_${index + 1}`
      }));

      const response = await api.createList({
        ...listData,
        templateFields: processedFields
      });

      if (response.success) {
        navigate(`/list/${response.data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 TopTastic</h1>
        <p>Crea listas colaborativas increíbles en segundos</p>
      </div>

      <main>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title">
              <strong>Título de tu lista</strong>
            </label>
            <input
              type="text"
              id="title"
              placeholder="ej: Las peores excusas, Las mejores películas de los 90..."
              value={listData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">
              <strong>Descripción (opcional)</strong>
            </label>
            <textarea
              id="description"
              placeholder="Describe de qué trata tu lista..."
              value={listData.description}
              onChange={handleDescriptionChange}
              rows="3"
            />
          </div>

          <fieldset>
            <legend>
              <strong>Campos de los elementos</strong>
            </legend>
            <p>
              <small>Define qué información tendrá cada elemento de tu lista</small>
            </p>

            {listData.templateFields.map((field, index) => (
              <div key={index} className="form-grid" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--pico-muted-border-color)', borderRadius: 'var(--pico-border-radius)' }}>
                <div>
                  <label htmlFor={`field-label-${index}`}>
                    Etiqueta del campo
                  </label>
                  <input
                    type="text"
                    id={`field-label-${index}`}
                    placeholder="ej: Título de película, Quién lo dijo..."
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`field-type-${index}`}>
                    Tipo de campo
                  </label>
                  <select
                    id={`field-type-${index}`}
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                  >
                    <option value="text">Texto</option>
                    <option value="textarea">Texto largo</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                    />
                    Obligatorio
                  </label>

                  {listData.templateFields.length > 1 && (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => removeField(index)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="secondary"
              onClick={addField}
            >
              + Añadir campo
            </button>
          </fieldset>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando lista...' : '🚀 Crear lista'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default HomePage;
