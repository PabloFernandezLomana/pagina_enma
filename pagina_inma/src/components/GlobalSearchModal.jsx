import React, { useState, useEffect } from 'react';
import { Search, X, Users, Shirt, ShoppingBag, FileText, ArrowRight } from 'lucide-react';

export const GlobalSearchModal = ({ isOpen, onClose, clients, products, orders, invoices, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearchTerm('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  const filteredClients = query ? clients.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.phone.includes(query) || 
    c.city.toLowerCase().includes(query)
  ).slice(0, 4) : [];

  const filteredProducts = query ? products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.sku.toLowerCase().includes(query)
  ).slice(0, 4) : [];

  const filteredOrders = query ? orders.filter(o => 
    o.id.toLowerCase().includes(query) || 
    o.clientName.toLowerCase().includes(query) ||
    o.status.toLowerCase().includes(query)
  ).slice(0, 4) : [];

  const filteredInvoices = query ? invoices.filter(i => 
    i.id.toLowerCase().includes(query) || 
    i.clientName.toLowerCase().includes(query)
  ).slice(0, 4) : [];

  const totalResults = filteredClients.length + filteredProducts.length + filteredOrders.length + filteredInvoices.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, pedido #PED, prenda, factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="search-modal-body">
          {!query && (
            <div className="search-placeholder-state">
              <p className="hint-title">Búsqueda rápida en ModaInma</p>
              <p className="hint-sub">Prueba buscando "María", "Vestido", "#PED-2026-001" o "Sevilla"</p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="search-empty-state">
              <p>No se encontraron resultados para "<strong>{searchTerm}</strong>"</p>
            </div>
          )}

          {/* Clients Results */}
          {filteredClients.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Users size={15} color="var(--blue-main)" />
                <span>Clientes</span>
              </div>
              {filteredClients.map(c => (
                <div 
                  key={c.id} 
                  className="result-item" 
                  onClick={() => { onSelectResult('clientes', c); onClose(); }}
                >
                  <div className="result-info">
                    <p className="result-name">{c.name}</p>
                    <p className="result-meta">Tel: {c.phone} • {c.city}</p>
                  </div>
                  <ArrowRight size={16} className="arrow-icon" />
                </div>
              ))}
            </div>
          )}

          {/* Products Results */}
          {filteredProducts.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <Shirt size={15} color="var(--rose-main)" />
                <span>Productos</span>
              </div>
              {filteredProducts.map(p => (
                <div 
                  key={p.id} 
                  className="result-item"
                  onClick={() => { onSelectResult('productos', p); onClose(); }}
                >
                  <img src={p.image} alt={p.name} className="result-thumb" />
                  <div className="result-info">
                    <p className="result-name">{p.name}</p>
                    <p className="result-meta">{p.category} • {p.salePrice.toFixed(2)}€</p>
                  </div>
                  <ArrowRight size={16} className="arrow-icon" />
                </div>
              ))}
            </div>
          )}

          {/* Orders Results */}
          {filteredOrders.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <ShoppingBag size={15} color="var(--sage-main)" />
                <span>Pedidos</span>
              </div>
              {filteredOrders.map(o => (
                <div 
                  key={o.id} 
                  className="result-item"
                  onClick={() => { onSelectResult('pedidos', o); onClose(); }}
                >
                  <div className="result-info">
                    <p className="result-name">{o.id} — {o.clientName}</p>
                    <p className="result-meta">Total: {o.total.toFixed(2)}€ • Estado: {o.status}</p>
                  </div>
                  <span className="badge badge-sage">{o.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Invoices Results */}
          {filteredInvoices.length > 0 && (
            <div className="result-group">
              <div className="result-group-title">
                <FileText size={15} color="var(--amber-main)" />
                <span>Facturas</span>
              </div>
              {filteredInvoices.map(i => (
                <div 
                  key={i.id} 
                  className="result-item"
                  onClick={() => { onSelectResult('facturas', i); onClose(); }}
                >
                  <div className="result-info">
                    <p className="result-name">{i.id} — {i.clientName}</p>
                    <p className="result-meta">Total: {i.total.toFixed(2)}€ • {i.status}</p>
                  </div>
                  <span className="badge badge-beige">{i.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-modal {
          max-width: 640px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--rose-border);
          box-shadow: var(--shadow-modal);
        }

        .search-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 22px;
          border-bottom: 1px solid var(--border-light);
          background: var(--bg-subtle);
        }

        .search-modal-header input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.05rem;
          font-family: inherit;
          color: var(--text-primary);
          outline: none;
        }

        .search-modal-body {
          padding: 18px;
          max-height: 420px;
          overflow-y: auto;
        }

        .search-placeholder-state, .search-empty-state {
          padding: 36px 18px;
          text-align: center;
          color: var(--text-muted);
        }

        .hint-title {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--rose-dark);
          margin-bottom: 4px;
        }

        .hint-sub {
          font-size: 0.82rem;
        }

        .result-group {
          margin-bottom: 16px;
        }

        .result-group-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-left: 8px;
        }

        .result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .result-item:hover {
          background: var(--rose-light);
          transform: translateX(4px);
        }

        .result-thumb {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          object-fit: cover;
        }

        .result-info {
          flex: 1;
        }

        .result-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .result-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .arrow-icon {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .result-item:hover .arrow-icon {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
