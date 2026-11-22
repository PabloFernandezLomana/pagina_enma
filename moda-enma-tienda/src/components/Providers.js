'use client';
// moda-enma-tienda/src/components/Providers.js
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="bottom-center" offset={88} toastOptions={{ style: { fontFamily: 'inherit', borderRadius: '14px' } }} />
    </CartProvider>
  );
}
