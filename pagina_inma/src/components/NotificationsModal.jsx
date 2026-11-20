import React, { useState } from 'react';
import { X, Bell, AlertTriangle, ShoppingBag, FileText, ArrowRight } from 'lucide-react';

export const NotificationsModal = ({ isOpen, onClose, orders, products, invoices, onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!isOpen) return null;

  const lowStockProducts = dismissed ? [] : products.filter(p => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalStock <= p.lowStockThreshold;
  });

  const pendingOrders = dismissed ? [] : orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando');
  const pendingInvoices = dismissed ? [] : invoices.filter(i => i.status === 'Pendiente');

  const handleDismissAll = () => {
    setDismissed(true);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} color="var(--primary-900)" />
            <h3>Notificaciones y Avisos de la Boutique</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lowStockProducts.length === 0 && pendingOrders.length === 0 && pendingInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700 }}>¡No tienes avisos pendientes!</p>
              <p style={{ fontSize: '0.82rem' }}>El catálogo, pedidos y facturación están al día.</p>
            </div>
          ) : (
            <>
              {lowStockProducts.length > 0 && (
                <div 
                  className="notification-item-card"
                  onClick={() => { onClose(); onNavigate('productos'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: '14px', cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{lowStockProducts.length} Prenda(s) con Stock Bajo</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Haz clic para revisar el catálogo y reponer prendas.</p>
                  </div>
                  <ArrowRight size={16} color="var(--primary-900)" />
                </div>
              )}

              {pendingOrders.length > 0 && (
                <div 
                  className="notification-item-card"
                  onClick={() => { onClose(); onNavigate('pedidos'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--tertiary-50)', border: '1px solid var(--tertiary-200)', borderRadius: '14px', cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--tertiary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{pendingOrders.length} Pedido(s) Pendientes de Entrega</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Revisa el tablero Kanban para preparar los envíos.</p>
                  </div>
                  <ArrowRight size={16} color="var(--tertiary-600)" />
                </div>
              )}

              {pendingInvoices.length > 0 && (
                <div 
                  className="notification-item-card"
                  onClick={() => { onClose(); onNavigate('facturas'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--secondary-50)', border: '1px solid var(--secondary-200)', borderRadius: '14px', cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--secondary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{pendingInvoices.length} Factura(s) Pendientes de Cobro</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Comprueba el estado de cobro de facturas.</p>
                  </div>
                  <ArrowRight size={16} color="var(--secondary-600)" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={handleDismissAll}>
            Entendido (Marcar leídas)
          </button>
        </div>
      </div>
    </div>
  );
};
