import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastNotification } from './components/ToastNotification';

import { DashboardView } from './components/Dashboard/DashboardView';
import { ClientesView } from './components/Clientes/ClientesView';
import { ProductosView } from './components/Productos/ProductosView';
import { PedidosView } from './components/Pedidos/PedidosView';
import { FacturasView } from './components/Facturas/FacturasView';
import { PlantillasView } from './components/Plantillas/PlantillasView';

import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';

import { LoginView } from './components/Auth/LoginView';
import { isFirebaseConfigured, auth, onAuthStateChanged, signOut } from './services/firebase';

import { 
  getProducts, 
  getClients, 
  getOrders, 
  getInvoices, 
  getTemplates, 
  getTasks,
  subscribeToFirebaseSync
} from './services/storageService';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // New Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Auth State
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(false);

  // Data States
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals state flags
  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [isOrderCreateModalOpen, setOrderCreateModalOpen] = useState(false);
  const [isClientCreateModalOpen, setClientCreateModalOpen] = useState(false);

  const loadAllData = () => {
    setProducts(getProducts());
    setClients(getClients());
    setOrders(getOrders());
    setInvoices(getInvoices());
    setTemplates(getTemplates());
    setTasks(getTasks());
  };

  useEffect(() => {
    loadAllData();

    const handleStorageUpdate = () => {
      loadAllData();
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);

    // Listen to Firebase Auth if configured
    let unsubAuth = () => {};
    if (isFirebaseConfigured() && auth) {
      unsubAuth = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setAuthLoading(false);
      });
    } else {
      setAuthLoading(false);
    }

    // Subscribe to Firestore realtime updates
    const unsubFirestore = subscribeToFirebaseSync();

    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Badge calculations
  const lowStockCount = products.filter(p => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalStock <= p.lowStockThreshold;
  }).length;

  const pendingOrdersCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const handleGlobalSearchResultSelect = (tab, item) => {
    setActiveTab(tab);
    showToast(`Navegando a ${tab}...`, 'info');
  };

  if (isFirebaseConfigured() && !authUser && !bypassAuth && !authLoading) {
    return (
      <LoginView 
        onLoginSuccess={() => showToast('¡Sesión iniciada con éxito!', 'success')} 
        onContinueDemo={() => setBypassAuth(true)}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        pendingOrdersCount={pendingOrdersCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        openQuickOrder={() => { setActiveTab('pedidos'); setOrderCreateModalOpen(true); }}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Content Body */}
      <div className="main-content">
        <TopBar 
          setMobileOpen={setMobileOpen}
          openSearch={() => setSearchModalOpen(true)}
          openNewOrder={() => { setActiveTab('pedidos'); setOrderCreateModalOpen(true); }}
          openNewClient={() => { setActiveTab('clientes'); setClientCreateModalOpen(true); }}
          openNewProduct={() => { setActiveTab('productos'); setProductFormOpen(true); }}
          openNotifications={() => setNotificationsModalOpen(true)}
          openSettings={() => setSettingsModalOpen(true)}
          openProfile={() => setProfileModalOpen(true)}
          pendingTasksCount={pendingTasksCount}
          onOpenTasks={() => setActiveTab('dashboard')}
        />

        <main>
          {activeTab === 'dashboard' && (
            <DashboardView 
              orders={orders}
              invoices={invoices}
              products={products}
              tasks={tasks}
              onNavigate={(tab) => setActiveTab(tab)}
              openNewOrder={() => { setActiveTab('pedidos'); setOrderCreateModalOpen(true); }}
              openNewProduct={() => { setActiveTab('productos'); setProductFormOpen(true); }}
              openNewClient={() => { setActiveTab('clientes'); setClientCreateModalOpen(true); }}
              showToast={showToast}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesView 
              clients={clients}
              orders={orders}
              templates={templates}
              showToast={showToast}
              isCreateModalOpen={isClientCreateModalOpen}
              setCreateModalOpen={setClientCreateModalOpen}
            />
          )}

          {activeTab === 'productos' && (
            <ProductosView 
              products={products}
              showToast={showToast}
              openFormModal={() => setProductFormOpen(true)}
              isFormModalOpen={isProductFormOpen}
              setFormModalOpen={setProductFormOpen}
            />
          )}

          {activeTab === 'pedidos' && (
            <PedidosView 
              orders={orders}
              clients={clients}
              products={products}
              templates={templates}
              showToast={showToast}
              isCreateModalOpen={isOrderCreateModalOpen}
              setCreateModalOpen={setOrderCreateModalOpen}
              onNavigateToInvoices={() => setActiveTab('facturas')}
            />
          )}

          {activeTab === 'facturas' && (
            <FacturasView 
              invoices={invoices}
              templates={templates}
              showToast={showToast}
            />
          )}

          {activeTab === 'plantillas' && (
            <PlantillasView 
              templates={templates}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette / Spotlight Search */}
      <GlobalSearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        clients={clients}
        products={products}
        orders={orders}
        invoices={invoices}
        onSelectResult={handleGlobalSearchResultSelect}
      />

      {/* Boutique Settings Modal */}
      <SettingsModal 
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        showToast={showToast}
      />

      {/* User Profile Modal */}
      <ProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        authUser={authUser}
        showToast={showToast}
      />

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        orders={orders}
        products={products}
        invoices={invoices}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Floating Toast Notification */}
      <ToastNotification 
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default App;
