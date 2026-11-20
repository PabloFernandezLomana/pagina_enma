import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Menu, 
  Bell, 
  Settings, 
  User,
  ShoppingBag, 
  UserPlus, 
  Shirt,
  ChevronDown
} from 'lucide-react';

export const TopBar = ({ 
  setMobileOpen, 
  openSearch, 
  openNewOrder, 
  openNewClient, 
  openNewProduct,
  openNotifications,
  openSettings,
  openProfile
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon-only mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>

        {/* Global Search Bar centered/left with Ctrl+K shortcut */}
        <div className="stitch-search-bar-wrapper" onClick={openSearch}>
          <Search size={17} className="search-icon" />
          <span className="search-placeholder">Buscar pedidos, clientes...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </div>
      </div>

      <div className="topbar-right">
        {/* "Crear Nuevo" (Dark Pill Button) */}
        <div className="quick-action-container">
          <button 
            className="btn btn-inverted"
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          >
            <Plus size={18} />
            <span>Crear Nuevo</span>
            <ChevronDown size={15} />
          </button>

          {quickMenuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setQuickMenuOpen(false)} />
              <div className="quick-dropdown">
                <button 
                  onClick={() => { setQuickMenuOpen(false); openNewOrder(); }}
                  className="quick-dropdown-item"
                >
                  <ShoppingBag size={17} color="var(--primary-900)" />
                  <div>
                    <p className="item-title">Nuevo Pedido</p>
                    <p className="item-sub">Registrar venta en pocos pasos</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setQuickMenuOpen(false); openNewClient(); }}
                  className="quick-dropdown-item"
                >
                  <UserPlus size={17} color="var(--tertiary-600)" />
                  <div>
                    <p className="item-title">Nuevo Cliente</p>
                    <p className="item-sub">Añadir ficha de cliente</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setQuickMenuOpen(false); openNewProduct(); }}
                  className="quick-dropdown-item"
                >
                  <Shirt size={17} color="var(--secondary-600)" />
                  <div>
                    <p className="item-title">Nuevo Producto</p>
                    <p className="item-sub">Añadir prenda al catálogo</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Action Icons: Bell, Gear, User Avatar */}
        <div className="topbar-icons">
          <button className="topbar-icon-btn" title="Notificaciones" onClick={openNotifications}>
            <Bell size={18} />
            <span className="icon-badge-dot"></span>
          </button>

          <button className="topbar-icon-btn" title="Ajustes" onClick={openSettings}>
            <Settings size={18} />
          </button>

          <div className="user-avatar-circle" title="Inma Boutique - Perfil" onClick={openProfile}>
            <User size={18} color="var(--primary-900)" />
          </div>
        </div>
      </div>

      <style>{`
        .topbar {
          height: 70px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-light);
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 800;
        }

        @media (max-width: 767px) {
          .topbar {
            padding: 0 16px;
          }
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          max-width: 520px;
        }

        .mobile-menu-btn {
          display: none;
        }

        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: inline-flex;
          }
        }

        .stitch-search-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: var(--radius-full);
          padding: 9px 18px;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stitch-search-bar-wrapper:hover {
          border-color: var(--primary-400);
          background: #FFFFFF;
          box-shadow: var(--shadow-sm);
        }

        .search-placeholder {
          font-size: 0.88rem;
          color: var(--text-muted);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-kbd {
          background: #FFFFFF;
          border: 1px solid var(--neutral-300);
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          font-family: inherit;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topbar-icons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .topbar-icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: var(--neutral-100);
          color: var(--neutral-700);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .topbar-icon-btn:hover {
          background: var(--primary-100);
          color: var(--primary-900);
          border-color: var(--primary-200);
        }

        .icon-badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--primary-600);
        }

        .user-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-200);
          border: 2px solid var(--primary-300);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .quick-action-container {
          position: relative;
        }

        .menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 850;
        }

        .quick-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 240px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 8px;
          z-index: 900;
          animation: slideUp 0.15s ease-out;
        }

        .quick-dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .quick-dropdown-item:hover {
          background: var(--primary-50);
        }

        .item-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .item-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
};
