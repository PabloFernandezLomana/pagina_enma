import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  FileText, 
  MessageSquare, 
  User, 
  Trash2, 
  Printer,
  ChevronRight, 
  X,
  CreditCard,
  Sparkles,
  AlertCircle,
  Filter,
  Package,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  saveOrder, 
  updateOrderStatus, 
  deleteOrder, 
  generateInvoiceFromOrder, 
  saveClient 
} from '../../services/storageService';

export const PedidosView = ({ 
  orders, 
  clients, 
  products, 
  templates, 
  showToast,
  isCreateModalOpen,
  setCreateModalOpen,
  onNavigateToInvoices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Multi-step Creation Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isInlineNewClient, setIsInlineNewClient] = useState(false);
  const [inlineClientData, setInlineClientData] = useState({ name: '', phone: '', email: '', address: '', city: '' });
  
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Bizum');
  const [shippingMethod, setShippingMethod] = useState('Envío Estándar');
  const [discount, setDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');

  const kanbanColumns = [
    { id: 'Pendiente', title: 'Pendiente', color: '#DE7676' },
    { id: 'Preparando', title: 'Preparando', color: '#C98A2C' },
    { id: 'Listo', title: 'Listo', color: '#2E7D32' },
    { id: 'Enviado', title: 'Enviado', color: '#5284B7' },
    { id: 'Entregado', title: 'Entregado', color: '#7D774F' }
  ];

  const handleOpenCreateModal = () => {
    setWizardStep(1);
    setSelectedClientId(clients[0]?.id || '');
    setIsInlineNewClient(clients.length === 0);
    setInlineClientData({ name: '', phone: '', email: '', address: '', city: '' });
    setOrderItems([]);
    setPaymentMethod('Bizum');
    setShippingMethod('Envío Estándar');
    setDiscount(0);
    setOrderNotes('');
    setCreateModalOpen(true);
  };

  const handleAddProductToOrder = (product, size) => {
    const variant = product.variants.find(v => v.size === size);
    if (!variant || variant.stock <= 0) {
      showToast(`Sin stock en talla ${size}`, 'error');
      return;
    }

    const existingIndex = orderItems.findIndex(i => i.productId === product.id && i.size === size);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      if (updated[existingIndex].quantity >= variant.stock) {
        showToast(`Stock máximo alcanzado (${variant.stock})`, 'error');
        return;
      }
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          size: size,
          color: variant.color || 'Estándar',
          quantity: 1,
          unitPrice: product.salePrice
        }
      ]);
    }
  };

  const handleRemoveOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - parseFloat(discount || 0));
  };

  const handleFinishCreateOrder = () => {
    if (orderItems.length === 0) {
      showToast('Añade al menos una prenda al pedido', 'error');
      return;
    }

    let finalClientId = selectedClientId;
    let finalClientName = '';
    let finalClientPhone = '';
    let finalClientAddress = '';

    if (isInlineNewClient || clients.length === 0) {
      if (!inlineClientData.name.trim() || !inlineClientData.phone.trim()) {
        showToast('Completa el nombre y teléfono del nuevo cliente', 'error');
        return;
      }
      const newClient = saveClient({
        name: inlineClientData.name.trim(),
        phone: inlineClientData.phone.trim(),
        email: inlineClientData.email.trim(),
        address: inlineClientData.address.trim(),
        city: inlineClientData.city.trim()
      });
      finalClientId = newClient.id;
      finalClientName = inlineClientData.name;
      finalClientPhone = inlineClientData.phone;
      finalClientAddress = `${inlineClientData.address}, ${inlineClientData.city}`;
    } else {
      const clientObj = clients.find(c => c.id === selectedClientId);
      if (clientObj) {
        finalClientName = clientObj.name;
        finalClientPhone = clientObj.phone;
        finalClientAddress = `${clientObj.address || ''}, ${clientObj.city || ''}`;
      }
    }

    const payload = {
      clientId: finalClientId,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      clientAddress: finalClientAddress,
      items: orderItems,
      subtotal: calculateSubtotal(),
      discount: parseFloat(discount || 0),
      total: calculateTotal(),
      status: 'Pendiente',
      paymentMethod,
      shippingMethod,
      notes: orderNotes
    };

    try {
      saveOrder(payload);
      setCreateModalOpen(false);
      showToast('¡Pedido creado correctamente!', 'success');
    } catch (err) {
      showToast(err.message || 'Error al guardar el pedido', 'error');
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    try {
      updateOrderStatus(orderId, newStatus);
      showToast(`Pedido #${orderId} movido a ${newStatus}`, 'info');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      if (newStatus === 'Entregado') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) {
      handleStatusChange(orderId, targetStatus);
    }
    setDraggedOrderId(null);
  };

  const handleSendWhatsAppUpdate = (order) => {
    if (!order || !order.clientPhone) {
      showToast('El cliente no tiene teléfono registrado', 'error');
      return;
    }

    const currentStatus = order.status || 'Pendiente';
    const clientFirstName = (order.clientName || 'Cliente').split(' ')[0];
    
    const matchingTemplate = (templates || []).find(t => 
      (t.title && t.title.toLowerCase().includes(currentStatus.toLowerCase())) ||
      (t.content && t.content.toLowerCase().includes(currentStatus.toLowerCase()))
    );

    let messageText = '';

    if (matchingTemplate) {
      messageText = matchingTemplate.content
        .replace(/{nombre}/g, clientFirstName)
        .replace(/{pedido}/g, order.id)
        .replace(/{total}/g, `${order.total.toFixed(2)}€`)
        .replace(/{monto}/g, `${order.total.toFixed(2)}€`);
      showToast(`Utilizando plantilla "${matchingTemplate.title}"`, 'success');
    } else {
      messageText = `¡Hola ${clientFirstName}! 🌸 Tu pedido #${order.id} en ModaInma está en estado: *${currentStatus.toUpperCase()}*. Total: ${order.total.toFixed(2)}€. ¡Gracias por confiar en nosotros!`;
    }

    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('34') ? cleanPhone : `34${cleanPhone}`;
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(messageText)}`;
    
    window.open(waUrl, '_blank');
    showToast(`Abriendo WhatsApp Web/App (${currentStatus})...`, 'info');
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getElapsedTime = (isoString) => {
    if (!isoString) return 'hace 1h';
    const diffHours = Math.round((new Date() - new Date(isoString)) / (1000 * 60 * 60));
    if (diffHours < 1) return 'hace unos min';
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShoppingBag size={26} color="var(--primary-900)" />
            <span>Embudo de Ventas</span>
          </h1>
          <p>Gestiona y sigue los pedidos de la boutique en todas las etapas.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => showToast('Filtrando por fecha...', 'info')}>
            <Filter size={16} />
            <span>Filtrar</span>
          </button>

          <button className="btn btn-inverted" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            <span>+ Crear Nuevo</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="pastel-card" style={{ padding: '12px 18px', marginBottom: '20px' }}>
        <div className="stitch-search-bar" style={{ maxWidth: '360px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por ID de pedido o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Kanban Board */}
      <div className="kanban-board-container">
        {kanbanColumns.map(col => {
          const colOrders = filteredOrders.filter(o => (o.status || 'Pendiente') === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div 
              key={col.id} 
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="column-header-title">
                  <span className="column-dot" style={{ background: col.color }}></span>
                  <span>{col.title}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({colOrders.length})</span>
                </div>
              </div>

              {/* Cards List in Column */}
              <div className="kanban-cards-list">
                {colOrders.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Sin pedidos en esta etapa
                  </p>
                ) : (
                  colOrders.map(order => {
                    const totalItems = order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 1;
                    const isNew = (new Date() - new Date(order.createdAt)) < 24 * 60 * 60 * 1000;

                    return (
                      <div 
                        key={order.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        className="kanban-card"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Top ID, Source Tag & Payment Status Chips */}
                        <div className="card-top-id-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="kanban-order-id">{order.id}</span>
                          {order.source === 'web' && (
                            <span className="stitch-pill" style={{ background: '#2D2926', color: '#FFFFFF', fontSize: '0.62rem', padding: '1px 5px' }}>
                              WEB
                            </span>
                          )}
                          {order.paymentMethod === 'cash' ? (
                            <span className="stitch-pill" style={{ background: '#FFF7DF', color: '#7D774F', fontSize: '0.62rem', padding: '1px 5px' }}>
                              Cobrar en mano
                            </span>
                          ) : (
                            <span className="stitch-pill" style={{ background: '#E8EEF5', color: '#2F567F', fontSize: '0.62rem', padding: '1px 5px' }}>
                              PayPal
                            </span>
                          )}
                          {isNew && <span className="stitch-pill stitch-pill-primary" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>NUEVO</span>}
                        </div>

                        {/* Customer Name */}
                        <h4 className="kanban-customer-name">{order.clientName}</h4>

                        {/* Items & Elapsed Time */}
                        <div className="kanban-meta-row">
                          <span className="meta-item">
                            <Package size={13} />
                            {totalItems} prenda(s)
                          </span>
                          <span className="meta-item">
                            <Clock size={13} />
                            {getElapsedTime(order.createdAt)}
                          </span>
                        </div>

                        {/* Amount & Quick Action (Avatar / Print / Notificar WhatsApp) */}
                        <div className="kanban-footer-row">
                          <span className="kanban-order-amount">{order.total.toFixed(2)}€</span>

                          <div className="kanban-footer-actions">
                            {/* Visual Avatar / Print / WhatsApp Notify button */}
                            {col.id === 'Listo' || col.id === 'Preparando' ? (
                              <button 
                                className="stitch-pill"
                                style={{ background: '#2E7D32', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); handleSendWhatsAppUpdate(order); }}
                                title="Enviar aviso de WhatsApp"
                              >
                                <MessageSquare size={13} />
                                Notificar
                              </button>
                            ) : (
                              <>
                                <button 
                                  className="btn-icon-only btn-sm-circle"
                                  onClick={(e) => { e.stopPropagation(); handleSendWhatsAppUpdate(order); }}
                                  title="Enviar WhatsApp"
                                >
                                  <MessageSquare size={13} color="var(--primary-900)" />
                                </button>
                                <button 
                                  className="btn-icon-only btn-sm-circle"
                                  onClick={(e) => { e.stopPropagation(); generateInvoiceFromOrder(order); showToast('Factura creada', 'success'); }}
                                  title="Imprimir Ticket"
                                >
                                  <Printer size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Pedido #{selectedOrder.id}</h2>
                <p className="text-body" style={{ fontSize: '0.8rem' }}>Cliente: {selectedOrder.clientName}</p>
              </div>
              <button className="btn-icon-only" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Cambiar Estado del Pedido</label>
                <select 
                  className="form-select"
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                >
                  {kanbanColumns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              <div className="order-items-breakdown" style={{ marginTop: '16px' }}>
                <h4>Prendas en el Pedido</h4>
                {selectedOrder.items && selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--neutral-200)' }}>
                    <span>{item.quantity}x {item.productName} ({item.size})</span>
                    <span style={{ fontWeight: 800 }}>{(item.quantity * item.unitPrice).toFixed(2)}€</span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                  Total: {selectedOrder.total.toFixed(2)}€
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => handleSendWhatsAppUpdate(selectedOrder)}>
                  <MessageSquare size={16} />
                  <span>WhatsApp</span>
                </button>

                {selectedOrder.paymentMethod === 'cash' && selectedOrder.paymentStatus !== 'paid' && (
                  <button 
                    className="btn btn-primary"
                    style={{ background: '#2E7D32', borderColor: '#2E7D32' }}
                    onClick={() => {
                      saveOrder({ ...selectedOrder, paymentStatus: 'paid' });
                      setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
                      showToast('Pedido marcado como cobrado en mano', 'success');
                    }}
                  >
                    <span>✓ Marcar como Cobrado</span>
                  </button>
                )}

                {selectedOrder.status !== 'Cancelado' && (
                  <button 
                    className="btn btn-secondary"
                    style={{ color: '#D9534F', borderColor: 'rgba(217, 83, 79, 0.3)' }}
                    onClick={() => {
                      if (window.confirm('¿Deseas cancelar el pedido? El stock de las prendas se devolverá automáticamente.')) {
                        updateOrderStatus(selectedOrder.id, 'Cancelado');
                        setSelectedOrder({ ...selectedOrder, status: 'Cancelado' });
                        showToast('Pedido cancelado y stock devuelto', 'info');
                      }
                    }}
                  >
                    <span>Cancelar Pedido</span>
                  </button>
                )}
              </div>

              <button className="btn btn-primary" onClick={() => { generateInvoiceFromOrder(selectedOrder); showToast('Factura generada', 'success'); if (onNavigateToInvoices) onNavigateToInvoices(); }}>
                <FileText size={16} />
                <span>Factura</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Create Order Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Pedido — Paso {wizardStep} de 3</h3>
              <button className="btn-icon-only" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {wizardStep === 1 && (
                <div>
                  <h4>Seleccionar o Crear Cliente</h4>
                  <div style={{ margin: '12px 0', display: 'flex', gap: '8px' }}>
                    {clients.length > 0 && (
                      <button 
                        type="button"
                        className={`btn btn-sm ${!isInlineNewClient ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setIsInlineNewClient(false)}
                      >
                        Cliente Existente
                      </button>
                    )}
                    <button 
                      type="button"
                      className={`btn btn-sm ${isInlineNewClient || clients.length === 0 ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setIsInlineNewClient(true)}
                    >
                      + Crear Nuevo Cliente
                    </button>
                  </div>

                  {!isInlineNewClient && clients.length > 0 ? (
                    <div className="form-group">
                      <label className="form-label">Selecciona Cliente</label>
                      <select 
                        className="form-select"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Nombre Completo *</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ana López"
                          value={inlineClientData.name}
                          onChange={(e) => setInlineClientData({ ...inlineClientData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Teléfono *</label>
                        <input 
                          type="tel" 
                          className="form-control"
                          placeholder="600112233"
                          value={inlineClientData.phone}
                          onChange={(e) => setInlineClientData({ ...inlineClientData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <h4>Añadir Ropa al Pedido</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', margin: '12px 0' }}>
                    {products.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--neutral-100)', borderRadius: '8px' }}>
                        <div>
                          <strong>{p.name}</strong> ({p.salePrice.toFixed(2)}€)
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {p.variants.map((v, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={v.stock <= 0}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleAddProductToOrder(p, v.size)}
                            >
                              {v.size} ({v.stock})
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--primary-50)', padding: '12px', borderRadius: '8px' }}>
                    <h5>Prendas Seleccionadas ({orderItems.length})</h5>
                    {orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px' }}>
                        <span>{item.productName} ({item.size})</span>
                        <span>{item.quantity}x {item.unitPrice.toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div>
                  <h4>Pago y Envío</h4>
                  <div className="form-group">
                    <label className="form-label">Método de Pago</label>
                    <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="Bizum">Bizum</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Efectivo">Efectivo</option>
                    </select>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <h3>Total: {calculateTotal().toFixed(2)}€</h3>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {wizardStep > 1 && (
                <button className="btn btn-secondary" onClick={() => setWizardStep(wizardStep - 1)}>
                  Anterior
                </button>
              )}

              {wizardStep < 3 ? (
                <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>
                  Siguiente
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleFinishCreateOrder}>
                  Crear Pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card-top-id-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .kanban-order-id {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--primary-900);
        }

        .kanban-customer-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .kanban-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .kanban-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--neutral-100);
        }

        .kanban-order-amount {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .kanban-footer-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-sm-circle {
          width: 32px;
          height: 32px;
        }
      `}</style>
    </div>
  );
};
