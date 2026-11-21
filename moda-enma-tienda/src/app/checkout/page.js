// moda-enma-tienda/src/app/checkout/page.js
import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Tramitar pedido', robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
