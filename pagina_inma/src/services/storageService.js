import {
  DEMO_PRODUCTS,
  DEMO_CLIENTS,
  DEMO_ORDERS,
  DEMO_INVOICES,
  DEMO_TEMPLATES,
  DEMO_TASKS
} from './mockData';
import { 
  isFirebaseConfigured, 
  db, 
  storage, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  ref,
  uploadString,
  getDownloadURL
} from './firebase';

const STORAGE_VERSION = 'v3_modainma_demo_ready';

const KEYS = {
  PRODUCTS: 'modainma_products',
  CLIENTS: 'modainma_clients',
  ORDERS: 'modainma_orders',
  INVOICES: 'modainma_invoices',
  TEMPLATES: 'modainma_templates',
  TASKS: 'modainma_tasks'
};

const notifyStorageChange = (key) => {
  window.dispatchEvent(new CustomEvent('storageUpdate', { detail: { key } }));
};

export const uploadImageToFirebase = async (base64String, path) => {
  if (!isFirebaseConfigured() || !storage) return base64String;
  if (!base64String || !base64String.startsWith('data:image')) return base64String;

  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`);
    await uploadString(storageRef, base64String, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err) {
    console.error('Error subiendo imagen a Firebase Storage:', err);
    return base64String;
  }
};

export const subscribeToFirebaseSync = () => {
  if (!isFirebaseConfigured() || !db) return () => {};

  const unsubscribes = [];
  const collections = [
    { key: KEYS.PRODUCTS, col: 'products' },
    { key: KEYS.CLIENTS, col: 'clients' },
    { key: KEYS.ORDERS, col: 'orders' },
    { key: KEYS.INVOICES, col: 'invoices' },
    { key: KEYS.TEMPLATES, col: 'templates' },
    { key: KEYS.TASKS, col: 'tasks' }
  ];

  collections.forEach(({ key, col }) => {
    const unsub = onSnapshot(collection(db, col), (snapshot) => {
      const docsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (docsData.length > 0) {
        localStorage.setItem(key, JSON.stringify(docsData));
        notifyStorageChange(key);
      }
    }, (err) => {
      console.warn(`Sincronización Firestore en ${col}:`, err);
    });
    unsubscribes.push(unsub);
  });

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

export const initStorage = () => {
  const currentVer = localStorage.getItem('modainma_version');
  
  if (currentVer !== STORAGE_VERSION) {
    if (localStorage.getItem(KEYS.PRODUCTS) === null) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
    }
    if (localStorage.getItem(KEYS.CLIENTS) === null) {
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
    }
    if (localStorage.getItem(KEYS.ORDERS) === null) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
    }
    if (localStorage.getItem(KEYS.INVOICES) === null) {
      localStorage.setItem(KEYS.INVOICES, JSON.stringify([]));
    }
    if (localStorage.getItem(KEYS.TASKS) === null) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
    }
    if (localStorage.getItem(KEYS.TEMPLATES) === null) {
      localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(DEMO_TEMPLATES));
    }
    localStorage.setItem('modainma_version', STORAGE_VERSION);
  }
};

export const clearAllData = () => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify([]));
  localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
  notifyStorageChange('ALL');
};

export const loadDemoData = () => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(DEMO_CLIENTS));
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(DEMO_INVOICES));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(DEMO_TASKS));
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(DEMO_TEMPLATES));
  notifyStorageChange('ALL');
};

// --- PRODUCTS ---
export const getProducts = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [];
  } catch (_e) {
    return [];
  }
};

export const saveProduct = async (product) => {
  const products = getProducts();
  let updated;
  let savedProduct;

  if (product.id) {
    savedProduct = { ...product };
    updated = products.map(p => p.id === product.id ? { ...p, ...product } : p);
  } else {
    const newId = `prod-${Date.now()}`;
    savedProduct = { ...product, id: newId, active: true };
    updated = [savedProduct, ...products];
  }

  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
  notifyStorageChange(KEYS.PRODUCTS);

  // Sincronizar inmediatamente con la tienda pública local (Next.js)
  try {
    fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedProduct)
    }).catch(() => {});
  } catch (_e) {}

  // Sincronización directa con Firestore para producción
  if (isFirebaseConfigured() && db) {
    try {
      const productRef = doc(db, 'products', savedProduct.id);
      await setDoc(productRef, savedProduct, { merge: true });
    } catch (err) {
      console.warn('Error sincronizando producto en Firestore:', err);
    }
  }

  return updated;
};

export const deleteProduct = async (id) => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  notifyStorageChange(KEYS.PRODUCTS);

  // Notificar borrado a la tienda pública local
  try {
    fetch(`http://localhost:3000/api/products?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch (_e) {}

  // Eliminar en Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.warn('Error eliminando producto de Firestore:', err);
    }
  }
};

// --- CLIENTS ---
export const getClients = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.CLIENTS)) || [];
  } catch (e) {
    return [];
  }
};

export const saveClient = async (client) => {
  const clients = getClients();
  let updated;
  let savedClient;
  if (client.id) {
    updated = clients.map(c => {
      if (c.id === client.id) {
        savedClient = { ...c, ...client };
        return savedClient;
      }
      return c;
    });
  } else {
    const newId = `cli-${Date.now()}`;
    savedClient = {
      ...client,
      id: newId,
      email: client.email || '',
      clientType: client.clientType || 'Cliente VIP',
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      lastPurchaseDate: null
    };
    updated = [savedClient, ...clients];
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  notifyStorageChange(KEYS.CLIENTS);

  if (isFirebaseConfigured() && db && savedClient) {
    try {
      await setDoc(doc(db, 'clients', savedClient.id), savedClient, { merge: true });
    } catch (err) {
      console.warn('Error sincronizando cliente en Firestore:', err);
    }
  }

  return savedClient;
};

export const deleteClient = async (id) => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  notifyStorageChange(KEYS.CLIENTS);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (err) {
      console.warn('Error eliminando cliente de Firestore:', err);
    }
  }
};

// --- ORDERS ---
export const getOrders = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
  } catch (e) {
    return [];
  }
};

export const checkOrderStockAvailable = (items) => {
  if (!items || items.length === 0) return { available: true };
  const products = getProducts();
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;
    const variant = product.variants ? product.variants.find(v => v.size === item.size) : null;
    const availableStock = variant ? variant.stock : 0;
    if (availableStock < item.quantity) {
      return {
        available: false,
        message: `Stock insuficiente para "${product.name}" (Talla ${item.size}). Disponible: ${availableStock}, Solicitado: ${item.quantity}`
      };
    }
  }
  return { available: true };
};

export const adjustStockForOrderItems = (items, direction = 'deduct') => {
  if (!items || items.length === 0) return;
  const products = getProducts();
  let modified = false;

  const updatedProducts = products.map(product => {
    const matchingItems = items.filter(i => i.productId === product.id);
    if (matchingItems.length === 0) return product;

    modified = true;
    const updatedVariants = (product.variants || []).map(variant => {
      const match = matchingItems.find(i => i.size === variant.size);
      if (!match) return variant;

      const qty = match.quantity || 1;
      const newStock = direction === 'deduct' 
        ? Math.max(0, variant.stock - qty) 
        : variant.stock + qty;
      return { ...variant, stock: newStock };
    });

    return { ...product, variants: updatedVariants };
  });

  if (modified) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    notifyStorageChange(KEYS.PRODUCTS);
  }
};

export const saveOrder = async (order) => {
  const orders = getOrders();
  let updated;
  let savedOrder;
  
  if (order.id) {
    updated = orders.map(o => {
      if (o.id === order.id) {
        savedOrder = { ...o, ...order };
        return savedOrder;
      }
      return o;
    });
  } else {
    // Validar stock antes de crear nuevo pedido
    const stockCheck = checkOrderStockAvailable(order.items);
    if (!stockCheck.available) {
      throw new Error(stockCheck.message);
    }

    const orderNum = orders.length + 101;
    const newId = `PED-2026-${String(orderNum).padStart(3, '0')}`;
    savedOrder = {
      ...order,
      id: newId,
      createdAt: new Date().toISOString(),
      status: order.status || 'Pendiente',
      invoiceGenerated: false,
      invoiceId: null
    };
    updated = [savedOrder, ...orders];

    // Descontar stock de productos por talla
    adjustStockForOrderItems(order.items, 'deduct');

    if (order.clientId) {
      const clients = getClients();
      const updatedClients = clients.map(c => {
        if (c.id === order.clientId) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + (order.total || 0),
            lastPurchaseDate: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      });
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updatedClients));
      notifyStorageChange(KEYS.CLIENTS);
    }
  }

  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
  notifyStorageChange(KEYS.ORDERS);

  if (isFirebaseConfigured() && db && savedOrder) {
    try {
      await setDoc(doc(db, 'orders', savedOrder.id), savedOrder, { merge: true });
    } catch (err) {
      console.warn('Error sincronizando pedido en Firestore:', err);
    }
  }

  return savedOrder;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const orders = getOrders();
  const now = new Date().toISOString();
  const targetOrder = orders.find(o => o.id === orderId);
  
  if (targetOrder) {
    // Manejo automático de devolución/descuento de stock si cambia a/de Cancelado
    if (targetOrder.status !== 'Cancelado' && newStatus === 'Cancelado') {
      adjustStockForOrderItems(targetOrder.items, 'restore');
    } else if (targetOrder.status === 'Cancelado' && newStatus !== 'Cancelado') {
      const stockCheck = checkOrderStockAvailable(targetOrder.items);
      if (!stockCheck.available) {
        throw new Error(stockCheck.message);
      }
      adjustStockForOrderItems(targetOrder.items, 'deduct');
    }
  }

  const updated = orders.map(o => {
    if (o.id === orderId) {
      const timestamps = {};
      if (newStatus === 'Enviado' && !o.shippedAt) timestamps.shippedAt = now;
      if (newStatus === 'Entregado' && !o.deliveredAt) timestamps.deliveredAt = now;
      
      return {
        ...o,
        status: newStatus,
        ...timestamps
      };
    }
    return o;
  });

  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
  notifyStorageChange(KEYS.ORDERS);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'orders', orderId), { status: newStatus }, { merge: true });
    } catch (err) {
      console.warn('Error actualizando estado de pedido en Firestore:', err);
    }
  }
};

export const deleteOrder = (id) => {
  const orders = getOrders();
  const targetOrder = orders.find(o => o.id === id);
  if (targetOrder && targetOrder.status !== 'Cancelado') {
    adjustStockForOrderItems(targetOrder.items, 'restore');
  }

  const filtered = orders.filter(o => o.id !== id);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(filtered));
  notifyStorageChange(KEYS.ORDERS);
};

// --- INVOICES ---
export const getInvoices = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.INVOICES)) || [];
  } catch (e) {
    return [];
  }
};

export const generateInvoiceFromOrder = (order) => {
  const invoices = getInvoices();
  const existing = invoices.find(i => i.orderId === order.id);
  if (existing) return existing;

  const invNum = invoices.length + 101;
  const newInvoiceId = `FACT-2026-${String(invNum).padStart(3, '0')}`;

  const newInvoice = {
    id: newInvoiceId,
    orderId: order.id,
    clientName: order.clientName || 'Cliente General',
    clientAddress: order.clientAddress || 'España',
    clientNif: 'ES-12345678X',
    date: new Date().toISOString().split('T')[0],
    items: order.items.map(item => ({
      name: `${item.productName} (${item.size ? 'Talla ' + item.size : ''} ${item.color || ''})`,
      quantity: item.quantity,
      price: item.unitPrice,
      total: item.quantity * item.unitPrice
    })),
    total: order.total,
    status: 'Pagada'
  };

  const updatedInvoices = [newInvoice, ...invoices];
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(updatedInvoices));

  const orders = getOrders();
  const updatedOrders = orders.map(o => o.id === order.id ? { ...o, invoiceGenerated: true, invoiceId: newInvoiceId } : o);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updatedOrders));

  notifyStorageChange(KEYS.INVOICES);
  notifyStorageChange(KEYS.ORDERS);
  return newInvoice;
};

export const updateInvoiceStatus = (id, status) => {
  const invoices = getInvoices().map(inv => inv.id === id ? { ...inv, status } : inv);
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  notifyStorageChange(KEYS.INVOICES);
};

// --- TEMPLATES ---
export const getTemplates = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.TEMPLATES)) || [];
  } catch (e) {
    return DEMO_TEMPLATES;
  }
};

export const saveTemplate = (template) => {
  const templates = getTemplates();
  let updated;
  if (template.id) {
    updated = templates.map(t => t.id === template.id ? template : t);
  } else {
    updated = [{ ...template, id: `tpl-${Date.now()}` }, ...templates];
  }
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
  notifyStorageChange(KEYS.TEMPLATES);
  return updated;
};

// --- TASKS ---
export const getTasks = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.TASKS)) || [];
  } catch (e) {
    return [];
  }
};

export const toggleTask = (id) => {
  const tasks = getTasks().map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  notifyStorageChange(KEYS.TASKS);
};

export const addTask = (text) => {
  const tasks = getTasks();
  const newTask = {
    id: `task-${Date.now()}`,
    text,
    completed: false,
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [newTask, ...tasks];
  localStorage.setItem(KEYS.TASKS, JSON.stringify(updated));
  notifyStorageChange(KEYS.TASKS);
  return updated;
};
