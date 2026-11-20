import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

export const metadata = {
  title: 'ModaEnma | Boutique & E-Commerce de Alta Gama',
  description: 'Colecciones exclusivas de moda femenina, masculina, niños, ropa deportiva y accesorios luxury. Confección contemporánea e inspirada en el minimalismo editorial.',
  keywords: 'moda, boutique, tienda online, ropa de lujo, ropa deportiva, accesorios, ModaEnma, Zara, Mango',
  openGraph: {
    title: 'ModaEnma Boutique Store',
    description: 'Moda de alta gama, catálogo multicategoría y experiencias 3D.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-warm-bg text-warm-dark antialiased selection:bg-brand-terracotta selection:text-white">
        <CartProvider>
          <div className="flex flex-col min-h-screen relative bg-warm-bg">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
