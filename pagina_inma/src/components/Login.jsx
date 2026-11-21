// pagina_inma/src/components/Login.jsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from './ui';

export default function Login({ backend }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await backend.auth.signIn(email.trim(), pass); }
    catch { toast.error('Correo o contraseña incorrectos'); setBusy(false); }
  };
  const forgot = async () => {
    if (!email.trim()) return toast.info('Escribe primero tu correo');
    try { await backend.auth.reset(email.trim()); toast.success('Te hemos enviado un correo para cambiar la contraseña'); }
    catch { toast.error('No hemos podido enviarlo'); }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">Moda<b>Enma</b></div>
        <h1>Tu panel de gestión 🌸</h1>
        <Field label="Correo"><input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Contraseña"><input className="input" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required /></Field>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <button type="button" className="btn btn-ghost btn-block" onClick={forgot}>Olvidé mi contraseña</button>
      </form>
    </div>
  );
}
