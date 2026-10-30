import { useState } from 'react';
import { api } from '../lib/api';
import { Field, Text, useToast } from './ui';

export default function AccountAdmin() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    if (f.next !== f.confirm) return toast('Les mots de passe ne correspondent pas', 'err');
    try {
      await api.post('/api/auth/password', f);
      toast('Mot de passe modifié');
      setF({ current: '', next: '', confirm: '' });
    } catch (e2) {
      toast(e2.message, 'err');
    }
  };
  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Mon compte</h1>
          <p>Modifiez le mot de passe d’accès à l’administration.</p>
        </div>
      </header>
      <form className="adm-card adm-narrow" onSubmit={submit}>
        <Field label="Mot de passe actuel">
          <Text type="password" value={f.current} onChange={(v) => setF({ ...f, current: v })} required />
        </Field>
        <Field label="Nouveau mot de passe" hint="8 caractères minimum">
          <Text type="password" value={f.next} onChange={(v) => setF({ ...f, next: v })} required />
        </Field>
        <Field label="Confirmer">
          <Text type="password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} required />
        </Field>
        <button className="adm-btn">Mettre à jour</button>
      </form>
    </div>
  );
}
