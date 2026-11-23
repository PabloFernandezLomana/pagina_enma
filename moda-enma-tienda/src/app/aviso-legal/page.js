// moda-enma-tienda/src/app/aviso-legal/page.js
import LegalPage, { H, P, owner } from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/site.config';

export const metadata = { title: 'Aviso legal', alternates: { canonical: '/aviso-legal' } };

export default function Page() {
  const o = owner();
  return (
    <LegalPage title="Aviso legal" intro="Información del titular de este sitio web, según la Ley 34/2002 de servicios de la sociedad de la información (LSSI-CE).">
      <H>1. Titular del sitio web</H>
      <P>Titular: {o.name}. NIF: {o.nif}. Domicilio: {o.address}. Correo electrónico: {o.email}.</P>
      <P>Nombre comercial: {SITE_CONFIG.brand.name}. Actividad: venta online de ropa, artículos deportivos y accesorios.</P>
      <H>2. Objeto y condiciones de uso</H>
      <P>Este sitio web permite conocer y comprar los productos de {SITE_CONFIG.brand.name}. Navegar por él supone aceptar este aviso legal. Te comprometes a usarlo de forma lícita y sin dañar su funcionamiento.</P>
      <H>3. Propiedad intelectual</H>
      <P>Los textos, imágenes, ilustraciones, diseño y marca de este sitio pertenecen al titular o se usan con autorización. No se pueden copiar ni distribuir sin permiso por escrito, salvo uso personal.</P>
      <H>4. Responsabilidad</H>
      <P>Procuramos que la información sea exacta y esté actualizada, pero pueden existir errores puntuales en precios, descripciones o disponibilidad. Si detectamos uno en un pedido, te lo comunicaremos antes de confirmarlo. No respondemos de interrupciones del servicio ajenas a nuestro control ni del contenido de sitios externos enlazados.</P>
      <H>5. Legislación y jurisdicción</H>
      <P>Este aviso se rige por la legislación española. Si eres consumidor, para cualquier conflicto serán competentes los juzgados de tu domicilio, conforme a la normativa de consumidores y usuarios.</P>
    </LegalPage>
  );
}
