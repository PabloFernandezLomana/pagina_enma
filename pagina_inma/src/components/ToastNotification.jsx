import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="var(--sage-main)" />,
    error: <AlertCircle size={20} color="var(--rose-main)" />,
    info: <Info size={20} color="var(--blue-main)" />,
    warning: <AlertCircle size={20} color="var(--amber-main)" />
  };

  return (
    <div className={`toast-container toast-${toast.type || 'info'}`}>
      {icons[toast.type || 'info']}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} title="Cerrar aviso">
        <X size={15} />
      </button>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 2500;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: var(--bg-card);
          border: 1px solid var(--rose-border);
          border-left: 4px solid var(--rose-main);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 420px;
        }

        .toast-container.toast-success {
          border-left-color: var(--sage-main);
        }

        .toast-container.toast-info {
          border-left-color: var(--blue-main);
        }

        .toast-container.toast-warning {
          border-left-color: var(--amber-main);
        }

        .toast-message {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .toast-close {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          margin-left: auto;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .toast-close:hover {
          background: var(--rose-light);
          color: var(--rose-dark);
        }
      `}</style>
    </div>
  );
};
