import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Copy, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  ShoppingBag,
  Contact,
  X,
  ExternalLink,
  Save,
  Download
} from 'lucide-react';
import { saveClient, deleteClient } from '../../services/storageService';
import { EmailModal } from '../EmailModal';

export const ClientesView = ({ 
  clients, 
  orders, 
  templates, 
  showToast,
  isCreateModalOpen,
  setCreateModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(clients[0] || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [privateNoteText, setPrivateNoteText] = useState(selectedClient?.notes || '');

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetClient, setEmailTargetClient] = useState(null);

  React.useEffect(() => {
    if (isCreateModalOpen) {
      handleOpenForm();
      if (setCreateModalOpen) setCreateModalOpen(false);
    }
  }, [isCreateModalOpen]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Sevilla',
    postalCode: '',
    clientType: 'Cliente VIP',
    notes: ''
  });

  // WhatsApp Modal State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0] || null);
  const [customMessage, setCustomMessage] = useState('');

  const handlePickContact = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      showToast('El selector de contactos sólo funciona en navegadores compatibles (ej. Chrome Android sobre HTTPS). Usa entrada manual.', 'warning');
      return;
    }

    try {
      const props = ['name', 'tel'];
      const contacts = await navigator.contacts.select(props, { multiple: false });
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const name = (contact.name && contact.name[0]) || '';
        const rawTel = (contact.tel && contact.tel[0]) || '';
        const cleanTel = rawTel.replace(/\D/g, '');
        const formattedPhone = cleanTel.length === 9 ? `34${cleanTel}` : cleanTel;

        setFormData(prev => ({
          ...prev,
          name: name || prev.name,
          phone: formattedPhone || prev.phone
        }));
        showToast(`Contacto "${name || formattedPhone}" importado`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo acceder a los contactos', 'error');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setPrivateNoteText(client.notes || '');
  };

  const handleOpenForm = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        city: client.city || 'Sevilla',
        postalCode: client.postalCode || '',
        clientType: client.clientType || 'Cliente VIP',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'Sevilla',
        postalCode: '',
        clientType: 'Cliente VIP',
        notes: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Introduce al menos nombre y teléfono', 'error');
      return;
    }

    const payload = editingClient ? { ...editingClient, ...formData } : formData;
    const saved = saveClient(payload);
    setIsFormOpen(false);
    setSelectedClient(saved);
    showToast(editingClient ? 'Ficha actualizada' : 'Cliente registrado', 'success');
  };

  const handleSavePrivateNotes = () => {
    if (!selectedClient) return;
    saveClient({ ...selectedClient, notes: privateNoteText });
    setSelectedClient({ ...selectedClient, notes: privateNoteText });
    showToast('Nota privada guardada correctamente', 'success');
  };

  const handleDeleteClient = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar la ficha de ${name}?`)) {
      deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(clients.find(c => c.id !== id) || null);
      showToast('Cliente eliminado', 'info');
    }
  };

  const handleOpenWhatsAppModal = (client) => {
    setSelectedClient(client);
    const initialTpl = templates[0];
    setSelectedTemplate(initialTpl);
    if (initialTpl) {
      setCustomMessage(
        initialTpl.content
          .replace('{nombre}', client.name.split(' ')[0])
          .replace('{total}', '0')
      );
    }
    setWhatsappModalOpen(true);
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient || !selectedClient.phone) return;
    const cleanPhone = selectedClient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('34') ? cleanPhone : `34${cleanPhone}`;
    const encodedText = encodeURIComponent(customMessage);
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    setWhatsappModalOpen(false);
    showToast('Abriendo WhatsApp...', 'info');
  };

  const getClientOrders = (clientId) => {
    return orders.filter(o => o.clientId === clientId);
  };

  const currentClientOrders = selectedClient ? getClientOrders(selectedClient.id) : [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Users size={26} color="var(--primary-900)" />
            <span>Gestión de Clientes</span>
          </h1>
          <p>Base de datos de compradores, direcciones, historial y notas privadas.</p>
        </div>

        <button className="btn btn-inverted" onClick={() => handleOpenForm()}>
          <Plus size={18} />
          <span>Añadir Cliente</span>
        </button>
      </div>

      {/* 3-Column Layout Container */}
      <div className="clients-three-columns-layout">
        
        {/* COLUMN 1 — Lista de clientes (Width: ~340px) */}
        <div className="pastel-card clients-list-column">
          <div className="clients-list-header">
            <h3>Clientes</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="import-link-btn" 
                onClick={handlePickContact}
                title="Importar contactos de la agenda"
              >
                <Download size={14} />
                <span>Importar</span>
              </button>
              <button 
                className="import-link-btn" 
                onClick={() => handleOpenForm()}
                style={{ color: 'var(--primary-900)', fontWeight: 800 }}
              >
                <Plus size={14} />
                <span>Crear</span>
              </button>
            </div>
          </div>

          <div className="stitch-search-bar" style={{ marginTop: '12px', marginBottom: '16px' }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar clientes (Ctrl+K)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="clients-scroll-list">
            {filteredClients.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No hay clientes registrados.
              </p>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                const clientOrders = getClientOrders(client.id);
                const tagType = client.clientType || 'Cliente VIP';

                return (
                  <div 
                    key={client.id}
                    className={`client-list-item-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="avatar-circle-sm">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="client-item-meta">
                      <div className="name-type-row">
                        <p className="item-name-bold">{client.name}</p>
                      </div>
                      <div className="type-orders-sub">
                        <span className={`stitch-pill ${
                          tagType === 'Cliente VIP' ? 'stitch-pill-primary' :
                          tagType === 'Mayorista' ? 'stitch-pill-tertiary' : 'stitch-pill-secondary'
                        }`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {tagType}
                        </span>
                        <span className="orders-count-text">{clientOrders.length} pedidos</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2 & 3 — Ficha del cliente seleccionado (Flex: 1) */}
        <div className="client-profile-main-column">
          {!selectedClient ? (
            <div className="pastel-card" style={{ textAlign: 'center', padding: '48px' }}>
              <Users size={36} color="var(--text-muted)" />
              <p style={{ marginTop: '12px' }}>Selecciona un cliente de la lista para ver su ficha completa.</p>
            </div>
          ) : (
            <div className="profile-container-stack">
              
              {/* Profile Header */}
              <div className="pastel-card profile-header-card">
                <div className="profile-header-top">
                  <div className="header-user-info">
                    <div className="avatar-circle-lg">
                      {selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-headline">{selectedClient.name}</h1>
                      <p className="location-gray">
                        <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {selectedClient.city || 'Sevilla'}, España
                      </p>
                    </div>
                  </div>

                  {/* Right side highlighted card: Total Gastado */}
                  <div className="total-spent-highlight-card">
                    <span className="spent-label">Total Gastado</span>
                    <h2 className="spent-amount">{(selectedClient.totalSpent || 0).toFixed(2)}€</h2>
                  </div>
                </div>

                {/* Circular Action Icons Row: WhatsApp, Call, Email */}
                <div className="profile-action-icons-row" style={{ marginTop: '18px' }}>
                  <button 
                    className="circle-icon-btn"
                    onClick={() => handleOpenWhatsAppModal(selectedClient)}
                    title="Enviar WhatsApp"
                  >
                    <MessageSquare size={18} />
                  </button>

                  <a 
                    href={`tel:${selectedClient.phone}`}
                    className="circle-icon-btn secondary-olive"
                    title="Llamar"
                  >
                    <Phone size={18} />
                  </a>

                  <button 
                    className="circle-icon-btn tertiary-blue"
                    onClick={() => { setEmailTargetClient(selectedClient); setEmailModalOpen(true); }}
                    title="Enviar Email"
                  >
                    <Mail size={18} />
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleOpenForm(selectedClient)}
                    style={{ marginLeft: 'auto' }}
                  >
                    <Edit3 size={15} />
                    <span>Editar Ficha</span>
                  </button>

                  <button 
                    className="btn-icon-only" 
                    onClick={() => handleDeleteClient(selectedClient.id, selectedClient.name)}
                    title="Eliminar Cliente"
                  >
                    <Trash2 size={15} color="var(--primary-700)" />
                  </button>
                </div>
              </div>

              {/* Grid 2 Columns: Contact Info & Private Notes */}
              <div className="profile-details-grid" style={{ marginTop: '20px' }}>
                {/* Card: Información de Contacto */}
                <div className="pastel-card">
                  <h3>Información de Contacto</h3>
                  <div className="contact-info-list" style={{ marginTop: '14px' }}>
                    <div className="info-line">
                      <Mail size={16} color="var(--primary-900)" />
                      <div>
                        <span className="info-label">Correo Electrónico</span>
                        <p className="info-val">{selectedClient.email || 'No registrado'}</p>
                      </div>
                    </div>

                    <div className="info-line">
                      <Phone size={16} color="var(--secondary-600)" />
                      <div>
                        <span className="info-label">Teléfono</span>
                        <p className="info-val">{selectedClient.phone}</p>
                      </div>
                    </div>

                    <div className="info-line">
                      <MapPin size={16} color="var(--tertiary-600)" />
                      <div>
                        <span className="info-label">Dirección de Envío</span>
                        <p className="info-val">{selectedClient.address || 'Sin dirección registrada'}</p>
                        <p className="info-sub-val">{selectedClient.postalCode} {selectedClient.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Notas Privadas */}
                <div className="pastel-card">
                  <h3>Notas Privadas</h3>
                  <p className="text-body" style={{ fontSize: '0.8rem', marginBottom: '10px' }}>
                    Anotaciones sobre preferencias de estilo o tallas.
                  </p>
                  <textarea 
                    rows="4"
                    className="form-control"
                    placeholder="Escribe notas privadas aquí..."
                    value={privateNoteText}
                    onChange={(e) => setPrivateNoteText(e.target.value)}
                  ></textarea>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSavePrivateNotes}>
                      <Save size={14} />
                      <span>Guardar Nota</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card: Pedidos Recientes (Table) */}
              <div className="pastel-card" style={{ marginTop: '20px' }}>
                <div className="widget-header">
                  <h3>Pedidos Recientes</h3>
                  <span className="text-body" style={{ fontSize: '0.82rem' }}>{currentClientOrders.length} pedidos</span>
                </div>

                <div className="table-responsive" style={{ marginTop: '10px' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'right' }}>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentClientOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            Este cliente aún no ha realizado pedidos.
                          </td>
                        </tr>
                      ) : (
                        currentClientOrders.map(o => (
                          <tr key={o.id}>
                            <td>
                              <span style={{ fontWeight: 800, color: 'var(--primary-900)' }}>{o.id}</span>
                            </td>
                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                o.status === 'Entregado' ? 'badge-sage' :
                                o.status === 'Enviado' ? 'badge-blue' : 'badge-rose'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>
                              {o.total.toFixed(2)}€
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Create / Edit Client Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</h3>
              <button className="btn-icon-only" onClick={() => setIsFormOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. María García López"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Teléfono *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="612345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de Cliente</label>
                    <select 
                      className="form-select"
                      value={formData.clientType}
                      onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    >
                      <option value="Cliente VIP">Cliente VIP</option>
                      <option value="Minorista">Minorista</option>
                      <option value="Mayorista">Mayorista</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dirección de Envío</label>
                    <input 
                      type="text" 
                      placeholder="Calle Sierpes 42"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad</label>
                    <input 
                      type="text" 
                      placeholder="Sevilla"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Preset Modal */}
      {whatsappModalOpen && selectedClient && (
        <div className="modal-overlay" onClick={() => setWhatsappModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enviar WhatsApp a {selectedClient.name}</h3>
              <button className="btn-icon-only" onClick={() => setWhatsappModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Plantilla</label>
                <select 
                  className="form-select"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const tpl = templates.find(t => t.id === e.target.value);
                    setSelectedTemplate(tpl);
                    if (tpl) {
                      setCustomMessage(
                        tpl.content
                          .replace('{nombre}', selectedClient.name.split(' ')[0])
                          .replace('{total}', '0')
                      );
                    }
                  }}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mensaje</label>
                <textarea 
                  rows="5"
                  className="form-control"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setWhatsappModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSendWhatsApp}>
                <ExternalLink size={16} />
                <span>Abrir en WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={emailTargetClient?.email || ''}
        clientName={emailTargetClient?.name || ''}
        templates={templates}
        showToast={showToast}
      />

      <style>{`
        .clients-three-columns-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .clients-three-columns-layout {
            flex-direction: column;
          }
          .clients-list-column {
            width: 100% !important;
          }
        }

        .clients-list-column {
          width: 320px;
          flex-shrink: 0;
        }

        .clients-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .import-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--primary-900);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .clients-scroll-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 600px;
          overflow-y: auto;
        }

        .client-list-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--neutral-100);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid transparent;
        }

        .client-list-item-row:hover {
          background: var(--primary-50);
        }

        .client-list-item-row.selected {
          background: #FFFFFF;
          border-color: var(--primary-300);
          box-shadow: var(--shadow-sm);
        }

        .avatar-circle-sm {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-200);
          color: var(--primary-900);
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-circle-lg {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--primary-300);
          color: var(--primary-900);
          font-weight: 800;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .client-item-meta {
          flex: 1;
        }

        .item-name-bold {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .type-orders-sub {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .orders-count-text {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .client-profile-main-column {
          flex: 1;
          min-width: 0;
        }

        .profile-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .location-gray {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .total-spent-highlight-card {
          padding: 14px 20px;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: var(--radius-sm);
          text-align: right;
        }

        .spent-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .spent-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-900);
        }

        .profile-action-icons-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .profile-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-line {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .info-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .info-sub-val {
          font-size: 0.76rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
