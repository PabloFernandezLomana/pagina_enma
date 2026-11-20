import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Shirt, 
  FileText, 
  MessageSquare, 
  Sparkles,
  Plus,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  lowStockCount, 
  pendingOrdersCount,
  mobileOpen,
  setMobileOpen,
  openQuickOrder,
  onOpenSettings
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard, badge: null },
    { id: 'productos', label: 'Productos', icon: Shirt, badge: lowStockCount ? `${lowStockCount}` : null, badgeColor: 'stitch-pill-primary' },
    { id: 'clientes', label: 'Clientes', icon: Users, badge: null },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount ? `${pendingOrdersCount}` : null, badgeColor: 'stitch-pill-tertiary' },
    { id: 'facturas', label: 'Facturas', icon: FileText, badge: null },
    { id: 'plantillas', label: 'Plantillas de WhatsApp', icon: MessageSquare, badge: null }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 900 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Top Header: Logo */}
        <div className="sidebar-header">
          <div className="logo-badge">
            <Sparkles size={20} color="var(--primary-900)" />
          </div>
          <div className="logo-text">
            <h2>ModaInma</h2>
            <span>Gestión</span>
          </div>
          {mobileOpen && (
            <button className="btn-icon-only mobile-close" onClick={() => setMobileOpen(false)}>
              <X size={20} color="#FFFFFF" />
            </button>
          )}
        </div>

        {/* Highlighted Button Under Logo: Pedido Rápido */}
        <div className="quick-action-hero-wrapper">
          <button 
            className="quick-order-btn"
            onClick={() => {
              if (openQuickOrder) openQuickOrder();
              else handleNavClick('pedidos');
            }}
          >
            <Plus size={16} color="var(--primary-900)" />
            <span>Pedido Rápido</span>
          </button>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className={`badge nav-badge ${item.badgeColor || 'stitch-pill-primary'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator & Footer Links */}
        <div className="sidebar-footer">
          <div className="sidebar-divider"></div>
          <button className="nav-link footer-link" onClick={() => onOpenSettings && onOpenSettings()}>
            <Settings size={18} className="nav-icon" />
            <span className="nav-label">Ajustes</span>
          </button>
          <button className="nav-link footer-link" onClick={() => onOpenSettings && onOpenSettings()}>
            <HelpCircle size={18} className="nav-icon" />
            <span className="nav-label">Soporte</span>
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: var(--neutral-800); /* Fondo oscuro Stitch */
          border-right: 1px solid var(--neutral-700);
          display: flex;
          flex-direction: column;
          z-index: 950;
          transition: transform 0.3s ease;
        }

        @media (max-width: 767px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: var(--shadow-modal);
          }
        }

        .sidebar-header {
          padding: 24px 20px 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .logo-badge {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--primary-300); /* Rosa pastel */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(244, 194, 194, 0.3);
        }

        .logo-text h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .logo-text span {
          font-size: 0.72rem;
          color: var(--primary-300);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .mobile-close {
          position: absolute;
          right: 16px;
          top: 24px;
          background: transparent;
          border: none;
        }

        .quick-action-hero-wrapper {
          padding: 0 20px 16px 20px;
        }

        .quick-order-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          background-color: var(--primary-300); /* Rosa pastel */
          color: var(--primary-900);
          font-family: var(--font-sans);
          font-weight: 800;
          font-size: 0.88rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(244, 194, 194, 0.25);
        }

        .quick-order-btn:hover {
          background-color: var(--primary-200);
          transform: translateY(-2px);
        }

        .sidebar-nav {
          padding: 8px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          background: transparent;
          color: var(--neutral-300);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          text-align: left;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        /* Active Link Highlighted with Light Pink Background */
        .nav-link.active {
          background: var(--primary-50);
          color: var(--primary-900);
          font-weight: 800;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        .nav-icon {
          color: var(--neutral-400);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .nav-link:hover .nav-icon {
          color: #FFFFFF;
          transform: scale(1.06);
        }

        .nav-link.active .nav-icon {
          color: var(--primary-900);
        }

        .nav-badge {
          margin-left: auto;
          font-size: 0.7rem;
          padding: 2px 8px;
        }

        .sidebar-footer {
          padding: 12px 14px 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--neutral-700);
          margin: 8px 6px 12px 6px;
        }

        .footer-link {
          padding: 9px 16px;
          font-size: 0.85rem;
          color: var(--neutral-400);
        }

        .footer-link:hover {
          color: #FFFFFF;
        }
      `}</style>
    </>
  );
};
