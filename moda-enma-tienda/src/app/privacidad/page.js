// moda-enma-tienda/src/app/privacidad/page.js
import LegalPage, { H, P, UL, owner } from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/site.config';

export const metadata = { title: 'Política de privacidad' };

export default function Page() {
  const o = owner();
  return (
    <LegalPage title="Política de privacidad" intro="Cómo tratamos tus datos personales, conforme al Reglamento (UE) 2016/679 (RGPD) y a la LOPDGDD 3/2018.">
      <H>1. Responsable</H>
      <P>Responsable del tratamiento: {o.name}, NIF {o.nif}, domicilio {o.address}. Contacto para cualquier cuestión de privacidad: {o.email}.</P>
      <H>2. Qué datos recogemos y para qué</H>
      <UL>
        <li><strong>Datos del pedido</strong> (nombre, correo, teléfono, dirección si pides envío, comentarios y artículos comprados): para gestionar tu compra, prepararla, enviarla o quedar contigo, y avisarte sobre su estado.</li>
        <li><strong>Datos de facturación y contabilidad</strong>: para cumplir nuestras obligaciones legales y fiscales.</li>
        <li><strong>Visitas a productos</strong>: contamos cuántas veces se ve cada prenda, de forma anónima y agregada, sin identificarte.</li>
      </UL>
      <H>3. Base jurídica</H>
      <P>La ejecución del contrato de compraventa que realizas con nosotros (art. 6.1.b RGPD) y el cumplimiento de obligaciones legales (art. 6.1.c). No tomamos decisiones automatizadas ni te enviamos publicidad sin tu consentimiento.</P>
      <H>4. Cuánto tiempo los conservamos</H>
      <P>Mientras sea necesario para gestionar el pedido y, después, bloqueados durante los plazos legales de prescripción (con carácter general, hasta 6 años por obligaciones mercantiles y fiscales).</P>
      <H>5. Con quién los compartimos</H>
      <UL>
        <li><strong>PayPal</strong>, si eliges pagar con PayPal. Gestiona el pago con su propia política de privacidad; nosotros no recibimos los datos de tu cuenta ni de tu tarjeta.</li>
        <li><strong>Google Firebase</strong> (base de datos y acceso al panel), como encargado del tratamiento, con las garantías contractuales del RGPD.</li>
        <li><strong>Cloudflare</strong> (alojamiento y entrega de la web) y <strong>Cloudinary</strong> (almacenamiento de las fotos de los productos), como encargados del tratamiento, con las garantías contractuales del RGPD.</li>
        <li><strong>Servicio de mensajería</strong>, solo si pides envío a domicilio, con los datos imprescindibles para entregarlo.</li>
      </UL>
      <P>No vendemos tus datos ni los cedemos a terceros con fines comerciales.</P>
      <H>6. Tus derechos</H>
      <P>Puedes acceder a tus datos, rectificarlos, suprimirlos, oponerte, limitar su tratamiento y pedir su portabilidad escribiendo a {o.email} e indicando el derecho que ejerces. Si crees que no tratamos bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</P>
      <H>7. Menores</H>
      <P>Las compras en {SITE_CONFIG.brand.name} deben hacerlas personas mayores de edad.</P>
    </LegalPage>
  );
}
