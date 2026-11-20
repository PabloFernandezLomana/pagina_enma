import { db, collection, doc, setDoc, getDoc, runTransaction, isFirebaseConfigured } from './firebase';

export async function createOnlineOrder(cartItems, shippingData) {
  const orderId = `PED-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
  const shippingCost = shippingData.shippingCost !== undefined ? shippingData.shippingCost : (subtotal > 90 ? 0 : 4.90);
  const total = parseFloat((subtotal + shippingCost).toFixed(2));

  const orderData = {
    id: orderId,
    clientId: shippingData.email || 'guest-online',
    clientName: shippingData.fullName,
    clientPhone: shippingData.phone,
    clientEmail: shippingData.email,
    clientAddress: `${shippingData.address}, ${shippingData.city} (${shippingData.postalCode})`,
    items: cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      size: item.size,
      color: item.color || 'Estándar',
      quantity: item.quantity,
      unitPrice: item.salePrice
    })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: 0,
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    total: total,
    status: 'Pendiente',
    paymentMethod: shippingData.paymentMethod || 'Tarjeta Bancaria (Stripe)',
    shippingMethod: shippingData.shippingMethod || 'Envío Express 24h/48h',
    origin: 'online',
    notes: shippingData.notes || 'Pedido web directo desde ModaEnma Store',
    createdAt: new Date().toISOString(),
    invoiceGenerated: false
  };

  if (isFirebaseConfigured() && db) {
    try {
      // Create Order Document in /orders
      const orderRef = doc(collection(db, 'orders'), orderId);
      await setDoc(orderRef, orderData);

      // Deduct stock in /products atomically via transaction
      await runTransaction(db, async (transaction) => {
        for (const item of cartItems) {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await transaction.get(productRef);

          if (productSnap.exists()) {
            const product = productSnap.data();
            const updatedVariants = (product.variants || []).map(v => {
              if (v.size === item.size) {
                return {
                  ...v,
                  stock: Math.max(0, (v.stock || 0) - item.quantity)
                };
              }
              return v;
            });
            transaction.update(productRef, { variants: updatedVariants });
          }
        }
      });

      return { success: true, orderId, data: orderData };
    } catch (err) {
      console.error("Error guardando pedido en Firestore:", err);
      // Fallback local save if Firestore rule/write fails
    }
  }

  // Local fallback storage for testing without live Firebase
  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('modainma_online_orders') || '[]');
    existing.push(orderData);
    localStorage.setItem('modainma_online_orders', JSON.stringify(existing));
  }

  return { success: true, orderId, data: orderData, isDemo: true };
}
