// pagina_inma/src/lib/invoicePdf.js — factura en PDF (sin desglose de IVA salvo que se active en site.config).
import { SITE_CONFIG } from '../site.config';

const money = (n) => `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;

export async function downloadInvoicePdf(inv, businessFallback = {}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const biz = { ...businessFallback, ...(inv.business || {}) };
  const W = 210, M = 18;
  let y = 22;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(196, 85, 45);
  doc.text(biz.name || SITE_CONFIG.brand.name, M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(80);
  [biz.legalName, biz.nif && `NIF: ${biz.nif}`, biz.address, [biz.phone, biz.email].filter(Boolean).join('  |  ')].filter(Boolean).forEach((l) => { y += 5; doc.text(String(l), M, y); });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(40);
  doc.text('FACTURA', W - M, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(80);
  doc.text(`Nº ${inv.id}`, W - M, 29, { align: 'right' });
  doc.text(`Fecha: ${new Date(inv.date).toLocaleDateString('es-ES')}`, W - M, 34, { align: 'right' });
  doc.text(`Pedido: ${inv.orderId}`, W - M, 39, { align: 'right' });

  y = Math.max(y, 42) + 12;
  doc.setDrawColor(226, 214, 198); doc.setFillColor(250, 246, 240);
  doc.roundedRect(M, y, W - 2 * M, 26, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(120);
  doc.text('FACTURADO A', M + 5, y + 7);
  doc.setFontSize(11); doc.setTextColor(40);
  doc.text(inv.client?.name || 'Cliente', M + 5, y + 14);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(80);
  doc.text([inv.client?.address, inv.client?.phone].filter(Boolean).join('  |  ').slice(0, 95), M + 5, y + 20);

  y += 38;
  const cols = { d: M, s: 104, q: 138, p: 160, t: W - M };
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(120);
  doc.text('DESCRIPCIÓN', cols.d, y); doc.text('TALLA', cols.s, y); doc.text('CANT.', cols.q, y, { align: 'right' }); doc.text('PRECIO', cols.p + 10, y, { align: 'right' }); doc.text('TOTAL', cols.t, y, { align: 'right' });
  doc.setDrawColor(40); doc.line(M, y + 2.5, W - M, y + 2.5);
  y += 9;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40);
  const rows = [...inv.items];
  if (inv.shippingCost > 0) rows.push({ name: 'Gastos de envío', size: '', quantity: 1, unitPrice: inv.shippingCost, total: inv.shippingCost });
  rows.forEach((r) => {
    doc.text(doc.splitTextToSize(String(r.name), 88)[0], cols.d, y);
    doc.text(String(r.size || ''), cols.s, y);
    doc.text(String(r.quantity), cols.q, y, { align: 'right' });
    doc.text(money(r.unitPrice), cols.p + 10, y, { align: 'right' });
    doc.text(money(r.total), cols.t, y, { align: 'right' });
    y += 7.5;
  });
  doc.setDrawColor(226, 214, 198); doc.line(M, y - 3, W - M, y - 3);

  y += 6;
  doc.setFontSize(10); doc.setTextColor(80);
  if (SITE_CONFIG.invoices.showVatBreakdown) {
    const base = inv.total / 1.21;
    doc.text('Base imponible', 140, y); doc.text(money(base), cols.t, y, { align: 'right' }); y += 6;
    doc.text('IVA 21 %', 140, y); doc.text(money(inv.total - base), cols.t, y, { align: 'right' }); y += 8;
  }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(40);
  doc.text('TOTAL', 140, y); doc.text(money(inv.total), cols.t, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`Estado: ${inv.status}.  Importe total, impuestos incluidos.`, M, y);
  doc.setFontSize(8.5);
  doc.text(`Gracias por tu compra en ${biz.name || SITE_CONFIG.brand.name}.`, W / 2, 285, { align: 'center' });
  doc.save(`${inv.id}.pdf`);
}
