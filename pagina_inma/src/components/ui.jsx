// pagina_inma/src/components/ui.jsx — piezas de interfaz compartidas.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export function Sheet({ title, onClose, children, footer, wide, labelledBy = 'sheet-title' }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        <div className="sheet-head">
          <h2 id={labelledBy}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X /></button>
        </div>
        {children}
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export const SheetBody = ({ children }) => <div className="sheet-body"><div className="stack-lg">{children}</div></div>;

export function Toggle({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)} />;
}

export function Field({ label, hint, children, error }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small style={{ color: 'rgb(var(--c-bad))' }}>{error}</small> : hint && <small className="hint">{hint}</small>}
    </label>
  );
}

export function Empty({ emoji = '🌸', title, text, action }) {
  return (
    <div className="empty">
      <div className="big" aria-hidden>{emoji}</div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

/* Confirmación propia (en vez de window.confirm) */
const ConfirmCtx = createContext(null);
export const useConfirm = () => useContext(ConfirmCtx);
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
  const close = (v) => { state.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="overlay center" style={{ zIndex: 80 }} onMouseDown={(e) => e.target === e.currentTarget && close(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="cf-t">
            <h2 id="cf-t">{state.title}</h2>
            {state.text && <p className="muted">{state.text}</p>}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => close(false)}>{state.cancel || 'Volver'}</button>
              <button className={`btn ${state.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>{state.ok || 'Aceptar'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
