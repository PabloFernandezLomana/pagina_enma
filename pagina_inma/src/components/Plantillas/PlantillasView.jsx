import React, { useState } from 'react';
import { MessageSquare, Plus, Edit3, Copy, Sparkles, Check } from 'lucide-react';
import { saveTemplate } from '../../services/storageService';

export const PlantillasView = ({ templates, showToast }) => {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: 'whatsapp', content: '' });

  const handleOpenForm = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({ title: template.title, type: template.type, content: template.content });
    } else {
      setEditingTemplate(null);
      setFormData({ title: '', type: 'whatsapp', content: '' });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Completa el título y el contenido de la plantilla', 'error');
      return;
    }

    const payload = editingTemplate ? { ...editingTemplate, ...formData } : formData;
    saveTemplate(payload);
    setEditingTemplate(null);
    setFormData({ title: '', type: 'whatsapp', content: '' });
    showToast('Plantilla guardada', 'success');
  };

  const insertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + ` ${tag} `
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Plantilla copiada al portapapeles', 'success');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <MessageSquare size={26} color="var(--sage-dark)" />
            <span>Plantillas de Mensajes WA / Email</span>
          </h1>
          <p>Mensajes rápidos preconfigurados para enviar a clientes sin escribir de más</p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenForm()}>
          <Plus size={18} />
          <span>Nueva Plantilla</span>
        </button>
      </div>

      {/* Editor & List Grid */}
      <div className="dashboard-grid">
        {/* Templates List */}
        <div className="templates-list-col">
          {templates.map((tpl, idx) => (
            <div key={tpl.id} className={`pastel-card template-card stagger-item stagger-${(idx % 6) + 1}`}>
              <div className="template-card-header">
                <div>
                  <h3>{tpl.title}</h3>
                  <span className="badge badge-sage">{tpl.type.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon-only" onClick={() => copyToClipboard(tpl.content)} title="Copiar">
                    <Copy size={15} />
                  </button>
                  <button className="btn-icon-only" onClick={() => handleOpenForm(tpl)} title="Editar">
                    <Edit3 size={15} />
                  </button>
                </div>
              </div>

              <div className="template-card-body">
                <p>{tpl.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Template Form Editor */}
        <div className="pastel-card editor-col">
          <h3>{editingTemplate ? 'Editar Plantilla' : 'Crear / Probar Plantilla'}</h3>
          <form onSubmit={handleSave} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Título de la Plantilla</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Agradecimiento por Compra"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Etiquetas Dinámicas Disponibles</label>
              <div className="tags-buttons-wrap">
                {['{nombre}', '{pedido}', '{total}', '{estado}', '{factura}'].map(tag => (
                  <button 
                    key={tag} 
                    type="button" 
                    className="tag-btn"
                    onClick={() => insertTag(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contenido del Mensaje</label>
              <textarea 
                rows="6"
                required
                className="form-control"
                placeholder="Hola {nombre}, tu pedido #{pedido}..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Guardar Plantilla
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .templates-list-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .template-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .template-card-body {
          background: var(--bg-subtle);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          line-height: 1.4;
        }

        .tags-buttons-wrap {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag-btn {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px dashed var(--sage-main);
          background: var(--sage-light);
          color: var(--sage-dark);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
