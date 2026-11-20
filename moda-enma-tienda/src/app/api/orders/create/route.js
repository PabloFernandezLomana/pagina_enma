// src/app/api/orders/create/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebaseAdmin';
import { calculateOrderTotalAndValidateStock } from '@/lib/serverPricing';
import { SITE_CONFIG } from '@/site.config';

const OrderSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(9, "Teléfono de contacto inválido"),
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  postalCode: z.string().min(4, "Código postal requerido"),
  paymentMethod: z.enum(['cash', 'paypal']),
  shippingMethod: z.enum(['delivery', 'pickup']),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los Términos y Condiciones y la Política de Privacidad" })
  }),
  honeypot: z.string().max(0, "Petición rechazada"), // Campo trampa anti-bot
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    size: z.string(),
    quantity: z.number().int().positive()
  })).min(1, "El carrito no puede estar vacío")
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: parsed.error.issues.map(i => i.message)
      }, { status: 400 });
    }

    const data = parsed.data;

    // Validación de zona de entrega para pago en mano
    if (data.paymentMethod === 'cash') {
      const allowedPostalCodes = SITE_CONFIG.shipping.postalCodesAllowedForCash;
      if (data.shippingMethod === 'delivery' && !allowedPostalCodes.includes(data.postalCode.trim())) {
        return NextResponse.json({
          error: 'El pago en mano para entrega a domicilio solo está disponible en códigos postales de Málaga seleccionados.'
        }, { status: 400 });
      }
    }

    // Recálculo del pedido en servidor con verificación de stock
    const calculation = await calculateOrderTotalAndValidateStock(data.items, data.shippingMethod, data.postalCode);

    const orderId = `PED-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderDocument = {
      id: orderId,
      source: 'web',
      clientName: data.fullName,
      clientEmail: data.email,
      clientPhone: data.phone,
      clientAddress: data.shippingMethod === 'pickup' ? 'Recogida en Boutique (Málaga)' : `${data.address}, ${data.city} (${data.postalCode})`,
      shippingMethod: data.shippingMethod === 'pickup' ? 'Recogida en Boutique' : 'Reparto Local Málaga',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cash' ? 'pending' : 'paid',
      subtotal: calculation.subtotal,
      shippingCost: calculation.shippingCost,
      total: calculation.total,
      items: calculation.items,
      status: 'Pendiente',
      notes: data.notes || (data.paymentMethod === 'cash' ? 'Cobrar en mano' : 'Pedido web'),
      termsAcceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      invoiceGenerated: false
    };

    // Escritura transaccional atómica en Firestore con Admin SDK
    if (adminDb) {
      await adminDb.runTransaction(async (transaction) => {
        // 1. Validar y descontar stock
        for (const item of calculation.items) {
          const productRef = adminDb.collection('products').doc(item.productId);
          const snap = await transaction.get(productRef);
          if (snap.exists) {
            const prod = snap.data();
            const updatedVariants = (prod.variants || []).map(v => {
              if (v.size === item.size) {
                const newStock = Math.max(0, (v.stock || 0) - item.quantity);
                return { ...v, stock: newStock };
              }
              return v;
            });
            transaction.update(productRef, { variants: updatedVariants });
          }
        }

        // 2. Guardar pedido en /orders
        const orderRef = adminDb.collection('orders').doc(orderId);
        transaction.set(orderRef, orderDocument);

        // 3. Crear o actualizar cliente en /clients
        const clientId = `cli-${data.phone.replace(/\D/g, '') || Date.now()}`;
        const clientRef = adminDb.collection('clients').doc(clientId);
        transaction.set(clientRef, {
          id: clientId,
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          lastPurchaseDate: new Date().toISOString().split('T')[0],
          clientType: 'Cliente Web'
        }, { merge: true });
      });
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      order: orderDocument
    });

  } catch (error) {
    console.error("Error creando pedido:", error);
    return NextResponse.json({
      error: error.message || 'Error al procesar el pedido'
    }, { status: 500 });
  }
}
