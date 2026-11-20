import React, { useState, useEffect } from 'react';
import { X, Store, Phone, MapPin, Save, Sliders, MessageSquare, Percent } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, showToast }) => {
  const [settings, setSettings] = useState({
    storeName: 'ModaInma Boutique',
    phone: '34612345678',
    address: 'Calle Sierpes 42, Sevilla',
    currency: '€',
    includeVat: false,
    defaultVatRate: 0,
    whatsappHeader: '¡Hola {nombre}! 🌸 Mensaje de ModaInma Boutique:'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('modainma_settings');
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('modainma_settings', JSON.stringify(settings));
      showToast('Configuración de la boutique guardada correctamente', 'success');
      onClose();
    } catch (err) {
      showToast('Error al guardar ajustes', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="var(--primary-900)" />
            <h3>Ajustes & Configuración de la Boutique</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre Comercial de la Tienda</label>
              <input 
                type="text"
                required
                className="form-control"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto (WhatsApp)</label>
                <input 
                  type="text"
                  required
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <input 
                  type="text"
                  className="form-control"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección Física de la Boutique</label>
              <input 
                type="text"
                className="form-control"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ background: 'var(--neutral-100)', padding: '14px', borderRadius: '12px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Configuración de Impuestos (Facturas)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox"
                    checked={!settings.includeVat}
                    onChange={(e) => setSettings({ ...settings, includeVat: !e.target.checked })}
                  />
                  <span>Sin IVA por defecto (Facturación Privada)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Encabezado Predeterminado de WhatsApp</label>
              <input 
                type="text"
                className="form-control"
                value={settings.whatsappHeader}
                onChange={(e) => setSettings({ ...settings, whatsappHeader: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Guardar Ajustes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
