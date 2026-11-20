import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { isFirebaseConfigured, auth, signInWithEmailAndPassword } from '../../services/firebase';

export const LoginView = ({ onLoginSuccess, onContinueDemo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor introduce email y contraseña');
      return;
    }

    if (!isFirebaseConfigured()) {
      setErrorMsg('Firebase no está configurado aún en el archivo .env');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email o contraseña incorrectos');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Demasiados intentos fallidos. Inténtalo de nuevo más tarde.');
      } else {
        setErrorMsg(`Error de autenticación: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const configured = isFirebaseConfigured();

  return (
    <div className="login-overlay">
      <div className="login-card pastel-card">
        <div className="login-header">
          <div className="brand-badge">
            <Sparkles size={20} color="var(--rose-main)" />
            <span>ModaInma Boutique</span>
          </div>
          <h2>Acceso Privado de Gestión</h2>
          <p>Panel exclusivo de administración comercial e inventario</p>
        </div>

        {errorMsg && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico (Email Administrador)</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                required
                placeholder="admin@modainma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Verificando sesión...' : 'Iniciar Sesión en el Sistema'}</span>
          </button>
        </form>

        {!configured && (
          <div className="demo-notice-box" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-medium)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              💡 Las variables <code>VITE_FIREBASE_*</code> aún no están configuradas en <code>.env</code>.
            </p>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onContinueDemo}
              style={{ width: '100%' }}
            >
              Continuar en Modo Demostración Local (LocalStorage)
            </button>
          </div>
        )}
      </div>

      <style>{`
        .login-overlay {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-app) 0%, var(--bg-subtle) 100%);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 32px 28px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-modal);
          background: var(--bg-card);
        }

        .login-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--rose-light);
          color: var(--rose-dark);
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 12px;
        }

        .login-header h2 {
          font-size: 1.45rem;
          color: var(--text-primary);
        }

        .login-header p {
          font-size: 0.83rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon input {
          padding-left: 40px;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .btn-block {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          margin-top: 8px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--rose-light);
          color: var(--rose-dark);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};
