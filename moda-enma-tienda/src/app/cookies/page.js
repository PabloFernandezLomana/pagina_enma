// moda-enma-tienda/src/app/cookies/page.js
import LegalPage, { H, P, UL } from '@/components/legal/LegalPage';

export const metadata = { title: 'Política de cookies' };

export default function Page() {
  return (
    <LegalPage title="Política de cookies" intro="Qué almacenamos en tu dispositivo y por qué.">
      <H>1. Lo que usamos</H>
      <UL>
        <li><strong>Almacenamiento técnico propio</strong> (localStorage y sessionStorage del navegador): guarda el contenido de tu bolsa, que ya has leído este aviso y que no cuentas dos veces la misma visita a un producto. Es necesario para que la tienda funcione y no requiere consentimiento.</li>
        <li><strong>PayPal</strong> (terceros): solo al pagar con PayPal, su botón puede instalar cookies necesarias para realizar el pago de forma segura, según su <a className="underline" href="https://www.paypal.com/es/webapps/mpp/ua/cookie-full" rel="noopener noreferrer" target="_blank">política de cookies</a>.</li>
      </UL>
      <H>2. Lo que no usamos</H>
      <P>No usamos cookies de publicidad, de seguimiento entre sitios ni de analítica que te identifique.</P>
      <H>3. Cómo borrarlas</H>
      <P>Puedes borrar o bloquear los datos del sitio desde los ajustes de tu navegador. Si lo haces, tu bolsa se vaciará.</P>
    </LegalPage>
  );
}
