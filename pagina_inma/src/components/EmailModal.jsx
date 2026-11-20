import React, { useState, useEffect } from 'react';
import { X, Mail, Send, ExternalLink, Copy, Check } from 'lucide-react';

export const EmailModal = ({ isOpen, onClose, recipientEmail = '', clientName = '', initialSubject = '', initialMessage = '', templates = [], showToast }) => {
  const [email, setEmail] = useState(recipientEmail);
  const [subject, setSubject] = useState(initialSubject || 'Información de tu pedido en ModaInma Boutique');
  const [body, setBody] = useState(initialMessage || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    setEmail(recipientEmail || '');
    setSubject(initialSubject || 'Información de tu pedido en ModaInma Boutique');
    setBody(initialMessage || '');
  }, [isOpen, recipientEmail, initialSubject, initialMessage]);

  if (!isOpen) return null;

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      const firstName = (clientName || 'Cliente').split(' ')[0];
      const processed = tpl.content
        .replace(/{nombre}/g, firstName)
        .replace(/{pedido}/g, 'PED-2026-001')
        .replace(/{total}/g, '0.00€');
      setBody(processed);
      if (tpl.title) {
        setSubject(`${tpl.title} - ModaInma Boutique`);
      }
    }
  };

  const handleSendEmail = () => {
    if (!email || !email.includes('@')) {
      showToast('Introduce una dirección de correo electrónico válida', 'error');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    if (showToast) showToast('Abriendo cliente de correo electrónico...', 'info');
    onClose();
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`Asunto: ${subject}\n\n${body}`);
    if (showToast) showToast('Contenido del correo copiado al portapapeles', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={20} color="var(--tertiary-600)" />
            <h3>Enviar Correo Electrónico (Email)</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Destinatario (Email del Cliente) *</label>
            <input 
              type="email"
              required
              placeholder="cliente@ejemplo.com"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {templates && templates.length > 0 && (
            <div className="form-group">
              <label className="form-label">Seleccionar Plantilla Predefinida</label>
              <select 
                className="form-select"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">-- Personalizado / Sin plantilla --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.type || 'email'})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Asunto del Correo *</label>
            <input 
              type="text"
              required
              placeholder="Ej. Confirmación de tu pedido #PED-2026-001"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cuerpo del Mensaje *</label>
            <textarea 
              rows="6"
              required
              className="form-control"
              placeholder="Escribe el mensaje del correo..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={handleCopyBody} title="Copiar asunto y cuerpo">
            <Copy size={16} />
            <span>Copiar Texto</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSendEmail} style={{ background: 'var(--tertiary-600)', borderColor: 'var(--tertiary-600)' }}>
              <ExternalLink size={16} />
              <span>Enviar Correo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
