import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  X, 
  Printer, 
  ExternalLink 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { updateInvoiceStatus } from '../../services/storageService';
import { EmailModal } from '../EmailModal';

export const FacturasView = ({ invoices, templates = [], showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetInvoice, setEmailTargetInvoice] = useState(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todas' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (invoice) => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(244, 239, 234); // Soft pastel cream
      doc.rect(0, 0, 210, 40, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(44, 42, 41);
      doc.text("ModaInma Boutique", 14, 22);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(92, 122, 103);
      doc.text("GESTIÓN PRIVADA - FACTURA OFICIAL", 14, 30);

      // Invoice Meta Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(44, 42, 41);
      doc.text(`FACTURA: ${invoice.id}`, 140, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${invoice.date}`, 140, 27);
      doc.text(`Estado: ${invoice.status.toUpperCase()}`, 140, 33);

      // Customer Info Box
      doc.setDrawColor(220, 215, 205);
      doc.rect(14, 48, 182, 30);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("DATOS DEL CLIENTE:", 18, 56);

      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${invoice.clientName}`, 18, 63);
      doc.text(`Dirección: ${invoice.clientAddress || 'España'}`, 18, 70);

      // Table Header
      let y = 92;
      doc.setFillColor(92, 122, 103);
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      doc.text("Descripción de la Prenda", 18, y + 5.5);
      doc.text("Cant.", 130, y + 5.5);
      doc.text("Precio U.", 150, y + 5.5);
      doc.text("Total", 178, y + 5.5);

      // Items Rows
      y += 12;
      doc.setTextColor(44, 42, 41);
      doc.setFont("helvetica", "normal");

      invoice.items.forEach((item) => {
        doc.text(String(item.name).substring(0, 50), 18, y);
        doc.text(String(item.quantity), 132, y);
        doc.text(`${item.price.toFixed(2)}€`, 150, y);
        doc.text(`${item.total.toFixed(2)}€`, 178, y);
        y += 8;
      });

      // Totals Box
      y += 10;
      doc.line(14, y, 196, y);
      y += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`TOTAL FACTURA:`, 120, y);
      doc.text(`${invoice.total.toFixed(2)}€`, 178, y);

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(140, 135, 130);
      doc.text("Gracias por su compra en ModaInma Boutique.", 14, 280);

      // Save File
      doc.save(`${invoice.id}_ModaInma.pdf`);
      showToast('PDF descargado con éxito', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al generar el PDF', 'error');
    }
  };

  const handleTogglePaidStatus = (invoice) => {
    const newStatus = invoice.status === 'Pagada' ? 'Pendiente' : 'Pagada';
    updateInvoiceStatus(invoice.id, newStatus);
    showToast(`Estado de factura cambiado a: ${newStatus}`, 'info');
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <FileText size={26} color="var(--amber-main)" />
            <span>Facturación & PDF</span>
          </h1>
          <p>Generación automática de documentos de cobro e impresiones</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="pastel-card filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nº factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="status-selector">
          <button 
            className={`pill-btn ${statusFilter === 'Todas' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Todas')}
          >
            Todas ({invoices.length})
          </button>
          <button 
            className={`pill-btn ${statusFilter === 'Pagada' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pagada')}
          >
            Pagadas
          </button>
          <button 
            className={`pill-btn ${statusFilter === 'Pendiente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pendiente')}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-responsive" style={{ marginTop: '20px' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nº Factura</th>
              <th>Pedido Asoc.</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total Importe</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Descarga & Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No se encontraron facturas registradas.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv, idx) => (
                <tr key={inv.id} className={`stagger-item stagger-${(idx % 6) + 1}`}>
                  <td>
                    <span 
                      className="inv-id-link"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      {inv.id}
                    </span>
                  </td>
                  <td>
                    <span className="date-sub">{inv.orderId}</span>
                  </td>
                  <td>
                    <p className="client-name">{inv.clientName}</p>
                  </td>
                  <td>
                    <span className="date-sub">{inv.date}</span>
                  </td>
                  <td>
                    <span className="total-price-tag">{inv.total.toFixed(2)}€</span>
                  </td>
                  <td>
                    <button 
                      className={`badge ${inv.status === 'Pagada' ? 'badge-sage' : 'badge-amber'}`}
                      onClick={() => handleTogglePaidStatus(inv)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {inv.status}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons-group">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEmailTargetInvoice(inv); setEmailModalOpen(true); }}
                        title="Enviar Factura por Email"
                      >
                        <Mail size={14} />
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadPDF(inv)}
                      >
                        <Download size={14} />
                        <span>PDF</span>
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal Preview */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content invoice-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vista Previa Factura {selectedInvoice.id}</h3>
              <button className="btn-icon-only" onClick={() => setSelectedInvoice(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Paper Preview Sheet */}
              <div className="invoice-paper">
                <div className="paper-header">
                  <div>
                    <h2>ModaInma Boutique</h2>
                    <p>Gestión de Pedidos & Administración Privada</p>
                  </div>
                  <div className="paper-inv-meta">
                    <h3>FACTURA #{selectedInvoice.id}</h3>
                    <p>Fecha: {selectedInvoice.date}</p>
                    <span className={`badge ${selectedInvoice.status === 'Pagada' ? 'badge-sage' : 'badge-amber'}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <div className="paper-client-box">
                  <p><strong>DATOS DEL CLIENTE:</strong></p>
                  <p>{selectedInvoice.clientName}</p>
                  <p>{selectedInvoice.clientAddress}</p>
                </div>

                <table className="paper-table">
                  <thead>
                    <tr>
                      <th>Prenda</th>
                      <th>Cant.</th>
                      <th>Precio U.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price.toFixed(2)}€</td>
                        <td>{item.total.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="paper-totals-box">
                  <h3 className="paper-final-total">TOTAL FACTURA: <span>{selectedInvoice.total.toFixed(2)}€</span></h3>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setEmailTargetInvoice(selectedInvoice); setEmailModalOpen(true); }}>
                <Mail size={16} />
                <span>Enviar por Email</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleTogglePaidStatus(selectedInvoice)}>
                Cambiar Estado a {selectedInvoice.status === 'Pagada' ? 'Pendiente' : 'Pagada'}
              </button>
              <button className="btn btn-primary" onClick={() => handleDownloadPDF(selectedInvoice)}>
                <Download size={16} />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={emailTargetInvoice?.clientEmail || ''}
        clientName={emailTargetInvoice?.clientName || ''}
        initialSubject={`Factura #${emailTargetInvoice?.id} - ModaInma Boutique`}
        initialMessage={`Estimado/a ${emailTargetInvoice?.clientName || 'cliente'},\n\nLe adjuntamos la información de su factura #${emailTargetInvoice?.id} por un importe total de ${emailTargetInvoice?.total.toFixed(2)}€.\n\nGracias por confiar en ModaInma Boutique.`}
        templates={templates}
        showToast={showToast}
      />

      <style>{`
        .inv-id-link {
          font-weight: 800;
          color: var(--amber-main);
          cursor: pointer;
        }

        .inv-id-link:hover {
          text-decoration: underline;
        }

        .status-selector {
          display: flex;
          gap: 8px;
        }

        .invoice-paper {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          font-size: 0.88rem;
        }

        .paper-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--border-light);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .paper-inv-meta {
          text-align: right;
        }

        .paper-client-box {
          background: var(--bg-subtle);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .paper-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .paper-table th, .paper-table td {
          padding: 8px;
          border-bottom: 1px solid var(--border-light);
          text-align: left;
        }

        .paper-totals-box {
          text-align: right;
        }

        .paper-final-total {
          font-size: 1.1rem;
          margin-top: 8px;
          color: var(--sage-dark);
        }
      `}</style>
    </div>
  );
};
