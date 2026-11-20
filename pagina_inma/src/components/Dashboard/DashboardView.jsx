import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  Shirt,
  UserPlus,
  Send,
  CheckSquare,
  Trash2,
  Database,
  Eye,
  ChevronDown
} from 'lucide-react';
import { addTask, toggleTask, clearAllData, loadDemoData } from '../../services/storageService';

export const DashboardView = ({ 
  orders, 
  invoices, 
  products, 
  tasks, 
  onNavigate, 
  openNewOrder, 
  openNewProduct,
  openNewClient,
  showToast 
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Alta');
  const [showDatabaseControls, setShowDatabaseControls] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculations from REAL data
  const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'Confirmado' || o.status === 'Preparando');
  const expressCount = pendingOrders.filter(o => o.shippingMethod === 'Envío Estándar' || o.shippingMethod === 'Urgente').length;
  
  const monthlyBilling = invoices
    .filter(i => i.status === 'Pagada')
    .reduce((acc, i) => acc + i.total, 0);

  const totalSalesAmount = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  // Low stock products calculation
  const lowStockProducts = products.filter(p => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalStock <= p.lowStockThreshold;
  });

  const lowStockCategories = Array.from(new Set(lowStockProducts.map(p => p.category))).join(', ') || 'Sin alertas';

  // Monthly Target Goal (e.g. 3000€)
  const targetGoal = 3000;
  const goalPercent = Math.min(100, Math.round((monthlyBilling / targetGoal) * 100));

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(`${newTaskText.trim()}||${newTaskPriority}`);
    setNewTaskText('');
    showToast('Tarea añadida a la lista', 'success');
  };

  const handleLoadDemo = () => {
    loadDemoData();
    showToast('Datos de demostración cargados', 'info');
  };

  const handleClearAllTestData = () => {
    if (window.confirm('¿Confirmas que deseas vaciar la base de datos a 0 para empezar en real?')) {
      clearAllData();
      showToast('Base de datos vaciada a 0.', 'success');
    }
  };

  return (
    <div className="page-container">
      {/* 1. Headline Greeting */}
      <div className="dashboard-greeting-hero stagger-item stagger-1">
        <div>
          <h1 className="text-headline">Buenos días, Inma 👋</h1>
          <p className="text-body greeting-sub">
            <span style={{ textTransform: 'capitalize' }}>{todayFormatted}</span> — Aquí tienes un resumen de las operaciones de tu boutique.
          </p>
        </div>
      </div>

      {/* 2. Row of 4 KPI Metrics Cards */}
      <div className="kpi-grid">
        {/* KPI 1: Ventas Totales */}
        <div className="kpi-card pastel-card stagger-item stagger-2">
          <div className="kpi-header">
            <span className="kpi-label">Ventas Totales</span>
            <div className="kpi-icon-circle bg-maroon">
              <TrendingUp size={20} color="#FFFFFF" />
            </div>
          </div>
          <h2 className="kpi-value">{totalSalesAmount.toFixed(2)}€</h2>
          <p className="kpi-context positive">+12.4% vs. mes anterior</p>
        </div>

        {/* KPI 2: Pedidos Pendientes */}
        <div className="kpi-card pastel-card stagger-item stagger-3">
          <div className="kpi-header">
            <span className="kpi-label">Pedidos Pendientes</span>
            <div className="kpi-icon-circle bg-blue">
              <Clock size={20} color="#FFFFFF" />
            </div>
          </div>
          <h2 className="kpi-value">{pendingOrders.length}</h2>
          <p className="kpi-context">{expressCount} son envíos exprés</p>
        </div>

        {/* KPI 3: Stock Bajo */}
        <div className="kpi-card pastel-card stagger-item stagger-4">
          <div className="kpi-header">
            <span className="kpi-label">Stock Bajo</span>
            <div className="kpi-icon-circle bg-olive">
              <AlertTriangle size={20} color="#FFFFFF" />
            </div>
          </div>
          <h2 className="kpi-value">{lowStockProducts.length} artículos</h2>
          <p className="kpi-context warning">Categorías: {lowStockCategories}</p>
        </div>

        {/* KPI 4: Facturación (mes actual) */}
        <div className="kpi-card pastel-card stagger-item stagger-5">
          <div className="kpi-header">
            <span className="kpi-label">Facturación (mes actual)</span>
            <div className="kpi-icon-circle bg-maroon">
              <FileText size={20} color="#FFFFFF" />
            </div>
          </div>
          <h2 className="kpi-value">{monthlyBilling.toFixed(2)}€</h2>
          <p className="kpi-context positive">{goalPercent}% del objetivo mensual alcanzado</p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Tareas Operativas, Acciones Rápidas & Pedidos Recientes */}
      <div className="dashboard-main-grid" style={{ marginTop: '24px' }}>
        
        {/* Left Column: Tareas Operativas */}
        <div className="pastel-card tasks-card">
          <div className="widget-header">
            <div>
              <h3>Tareas Operativas</h3>
              <p className="text-body" style={{ fontSize: '0.8rem' }}>Checklist de pendientes diarias</p>
            </div>
            <form onSubmit={handleAddTask} className="add-task-inline">
              <input 
                type="text" 
                placeholder="Añadir tarea..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="form-control input-sm"
              />
              <button type="submit" className="circle-icon-btn btn-sm-circle" title="Añadir">
                <Plus size={16} color="#FFFFFF" />
              </button>
            </form>
          </div>

          <div className="tasks-checklist">
            {tasks.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No hay tareas pendientes. ¡Todo al día!
              </p>
            ) : (
              tasks.map(task => {
                const parts = task.text.split('||');
                const title = parts[0];
                const priority = parts[1] || 'Media';

                return (
                  <div key={task.id} className={`task-row-item ${task.completed ? 'completed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <div className="task-info" onClick={() => toggleTask(task.id)}>
                      <p className="task-title">{title}</p>
                      <p className="task-sub-date">Registrada el {task.date || 'hoy'}</p>
                    </div>
                    <span className={`stitch-pill ${priority === 'Alta' ? 'stitch-pill-primary' : 'stitch-pill-secondary'}`}>
                      {priority === 'Alta' ? 'Alta Prioridad' : 'Media'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Acciones Rápidas & Pedidos Recientes */}
        <div className="dashboard-right-stack">
          {/* Card: Acciones Rápidas (Cuadrícula 2x2) */}
          <div className="pastel-card quick-actions-card">
            <h3>Acciones Rápidas</h3>
            <div className="quick-actions-2x2">
              <button className="quick-action-tile" onClick={openNewProduct}>
                <div className="tile-icon-circle bg-maroon">
                  <Shirt size={22} color="#FFFFFF" />
                </div>
                <span>Nuevo Producto</span>
              </button>

              <button className="quick-action-tile" onClick={openNewClient || (() => onNavigate('clientes'))}>
                <div className="tile-icon-circle bg-blue">
                  <UserPlus size={22} color="#FFFFFF" />
                </div>
                <span>Añadir Cliente</span>
              </button>

              <button className="quick-action-tile" onClick={openNewOrder}>
                <div className="tile-icon-circle bg-olive">
                  <ShoppingBag size={22} color="#FFFFFF" />
                </div>
                <span>Pedido Manual</span>
              </button>

              <button className="quick-action-tile" onClick={() => onNavigate('plantillas')}>
                <div className="tile-icon-circle bg-dark">
                  <Send size={22} color="#FFFFFF" />
                </div>
                <span>Enviar Difusión</span>
              </button>
            </div>
          </div>

          {/* Card: Pedidos Recientes */}
          <div className="pastel-card recent-orders-card" style={{ marginTop: '20px' }}>
            <div className="widget-header">
              <h3>Pedidos Recientes</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('pedidos')}>
                <span>Ver Todo</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="compact-orders-list">
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No hay pedidos registrados.
                </p>
              ) : (
                orders.slice(0, 4).map(o => (
                  <div key={o.id} className="compact-order-row" onClick={() => onNavigate('pedidos')}>
                    <div>
                      <span className="order-id-code">{o.id}</span>
                      <p className="order-client-name">{o.clientName}</p>
                    </div>
                    <span className={`badge ${
                      o.status === 'Entregado' ? 'badge-sage' :
                      o.status === 'Enviado' ? 'badge-blue' :
                      o.status === 'Preparando' ? 'badge-rose' : 'badge-amber'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Base de datos accordion discreto */}
      <div className="pastel-card db-tools-card" style={{ marginTop: '28px' }}>
        <div 
          className="db-tools-header"
          onClick={() => setShowDatabaseControls(!showDatabaseControls)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={17} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Opciones de Demostración & Limpieza
            </span>
          </div>
          <ChevronDown 
            size={18} 
            color="var(--text-muted)" 
            style={{ transform: showDatabaseControls ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
          />
        </div>

        {showDatabaseControls && (
          <div className="db-tools-content" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleLoadDemo}>
                <Eye size={15} color="var(--tertiary-600)" />
                <span>Cargar Datos de Ejemplo</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleClearAllTestData} style={{ color: 'var(--primary-700)' }}>
                <Trash2 size={15} />
                <span>Vaciar Datos (0% Empezar de cero)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-greeting-hero {
          margin-bottom: 24px;
        }

        .greeting-sub {
          margin-top: 4px;
          color: var(--text-muted);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .kpi-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-maroon { background: var(--primary-900); }
        .bg-blue { background: var(--tertiary-500); }
        .bg-olive { background: var(--secondary-500); }
        .bg-dark { background: var(--neutral-800); }

        .kpi-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .kpi-context {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .kpi-context.positive { color: #2E7D32; }
        .kpi-context.warning { color: var(--primary-700); }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .add-task-inline {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-sm-circle {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
        }

        .tasks-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-row-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--neutral-100);
          border-radius: var(--radius-sm);
          transition: background-color 0.2s ease;
        }

        .task-row-item.completed {
          opacity: 0.55;
          text-decoration: line-through;
        }

        .task-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-900);
          cursor: pointer;
        }

        .task-info {
          flex: 1;
          cursor: pointer;
        }

        .task-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .task-sub-date {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .quick-actions-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .quick-action-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 12px;
          background: var(--neutral-50);
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-action-tile:hover {
          background: #FFFFFF;
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-300);
        }

        .tile-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .quick-action-tile span {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .compact-orders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .compact-order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--neutral-100);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .compact-order-row:hover {
          background: var(--primary-50);
        }

        .order-id-code {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--primary-900);
        }

        .order-client-name {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
