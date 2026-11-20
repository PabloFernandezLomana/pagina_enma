import React from 'react';
import { X, User, Shield, LogOut, CheckCircle, Mail } from 'lucide-react';
import { isFirebaseConfigured, auth, signOut } from '../services/firebase';

export const ProfileModal = ({ isOpen, onClose, authUser, showToast }) => {
  if (!isOpen) return null;

  const handleSignOut = () => {
    if (isFirebaseConfigured() && auth) {
      signOut(auth).then(() => {
        showToast('Sesión cerrada con éxito', 'info');
        onClose();
      }).catch(err => {
        console.error(err);
      });
    } else {
      showToast('Modo de prueba local reiniciado', 'info');
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="var(--primary-900)" />
            <h3>Perfil de Usuario</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div className="avatar-circle-lg" style={{ margin: '0 auto 16px auto', width: '64px', height: '64px', fontSize: '1.5rem', background: 'var(--primary-300)', color: 'var(--primary-900)' }}>
            IN
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Inma Boutique</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
            {authUser?.email || 'inma@modainma.es'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0 24px 0' }}>
            <span className="stitch-pill stitch-pill-primary">
              <Shield size={12} />
              Administradora Principal
            </span>
            <span className="stitch-pill stitch-pill-secondary">
              <CheckCircle size={12} color="#2E7D32" />
              100% Operativa
            </span>
          </div>

          <div style={{ background: 'var(--neutral-100)', padding: '16px', borderRadius: '14px', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rol de Acceso:</span>
              <span style={{ fontWeight: 700 }}>Propietaria Boutique</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Modo de Sincronización:</span>
              <span style={{ fontWeight: 700 }}>{isFirebaseConfigured() ? 'Firebase Cloud Live' : 'Local Storage 100% Privado'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estado del Sistema:</span>
              <span style={{ fontWeight: 700, color: '#2E7D32' }}>Activa & Segura</span>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={handleSignOut} style={{ background: '#D9534F', borderColor: '#D9534F' }}>
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
