// pagina_inma/src/components/Login.jsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from './ui';

export default function Login({ backend }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  // Mensaje según la causa real (antes todo se mostraba como "contraseña incorrecta").
  const reason = (err) => {
    switch (err?.code) {
      case 'auth/invalid-credential': case 'auth/wrong-password': case 'auth/user-not-found': case 'auth/invalid-login-credentials':
        return 'Correo o contraseña incorrectos. Si no la recuerdas, pulsa «Olvidé mi contraseña».';
      case 'auth/invalid-email': return 'El correo no parece válido. Revisa que no tenga errores.';
      case 'auth/user-disabled': return 'Esta cuenta está desactivada. Habla con quien administra el panel.';
      case 'auth/too-many-requests': return 'Demasiados intentos fallidos. Espera unos minutos o usa «Olvidé mi contraseña» para cambiarla.';
      case 'auth/network-request-failed': return 'No hay conexión con internet. Inténtalo de nuevo.';
      default: return `No se ha podido entrar${err?.code ? ` (${err.code})` : ''}. Inténtalo de nuevo.`;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await backend.auth.signIn(email.trim().toLowerCase(), pass); }
    catch (err) { toast.error(reason(err), { duration: 8000 }); setBusy(false); }
  };
  const forgot = async () => {
    if (!email.trim()) return toast.info('Escribe primero tu correo');
    try { await backend.auth.reset(email.trim().toLowerCase()); toast.success('Si ese correo tiene cuenta, te llegará un mensaje para cambiar la contraseña. Mira también en Spam o Promociones (lo envía noreply@moda-enma.firebaseapp.com).', { duration: 12000 }); }
    catch (err) { toast.error(err?.code === 'auth/too-many-requests' ? 'Demasiados intentos. Espera unos minutos.' : 'No hemos podido enviarlo. Revisa el correo.'); }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">Moda<b>Enma</b></div>
        <h1>Tu panel de gestión 🌸</h1>
        <Field label="Correo"><input className="input" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Contraseña"><input className="input" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required /></Field>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <button type="button" className="btn btn-ghost btn-block" onClick={forgot}>Olvidé mi contraseña</button>
      </form>
    </div>
  );
}
