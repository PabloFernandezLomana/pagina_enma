// src/lib/serverPricing.js
import { adminDb } from './firebaseAdmin';
import { INITIAL_PRODUCTS } from './mockCatalog';
import { SITE_CONFIG } from '@/site.config';

export async function calculateOrderTotalAndValidateStock(items, shippingMethod, postalCode) {
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    let productData = null;

    if (adminDb) {
      try {
        const docRef = adminDb.collection('products').doc(item.productId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          productData = docSnap.data();
        }
      } catch (err) {
        console.warn(`Error buscando producto ${item.productId} en Firestore Admin:`, err);
      }
    }

    if (!productData) {
      productData = INITIAL_PRODUCTS.find(p => p.id === item.productId);
    }

    if (!productData) {
      throw new Error(`El producto con ID ${item.productId} ya no está disponible.`);
    }

    const variant = (productData.variants || []).find(v => v.size === item.size);
    const availableStock = variant ? (variant.stock || 0) : 0;

    if (availableStock < item.quantity) {
      throw new Error(`Stock insuficiente para "${productData.name}" en talla ${item.size}. Disponible: ${availableStock}, Solicitado: ${item.quantity}`);
    }

    const unitPrice = parseFloat(productData.salePrice || 0);
    const lineTotal = parseFloat((unitPrice * item.quantity).toFixed(2));
    subtotal += lineTotal;

    validatedItems.push({
      productId: item.productId,
      productName: productData.name,
      sku: productData.sku || '',
      size: item.size,
      color: variant?.color || 'Estándar',
      quantity: item.quantity,
      unitPrice: unitPrice,
      total: lineTotal
    });
  }

  subtotal = parseFloat(subtotal.toFixed(2));

  // Cálculo de envío según site.config
  let shippingCost = 0;
  if (shippingMethod === 'pickup') {
    shippingCost = 0;
  } else {
    shippingCost = subtotal >= SITE_CONFIG.shipping.freeShippingThreshold ? 0 : SITE_CONFIG.shipping.localDeliveryCost;
  }

  const grandTotal = parseFloat((subtotal + shippingCost).toFixed(2));

  return {
    subtotal,
    shippingCost,
    total: grandTotal,
    items: validatedItems
  };
}
