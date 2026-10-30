import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useSite } from '../lib/site';
import Icon from './Icon';
import { Magnetic } from './motion';

export default function ContactForm({ dark = true }) {
  const { data } = useSite();
  const types = data?.settings?.projectTypes || [];
  const [f, setF] = useState({ name: '', email: '', phone: '', project_type: '', message: '', website: '' });
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    setErr('');
    try {
      await api.post('/api/contact', f);
      setState('sent');
    } catch (e2) {
      setErr(e2.message);
      setState('idle');
    }
  };

  return (
    <div className={`cform ${dark ? 'cform--dark' : ''}`}>
      <AnimatePresence mode="wait">
        {state === 'sent' ? (
          <motion.div key="ok" className="cform__ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="cform__okicon">
              <Icon name="check" size={34} stroke={2} />
            </span>
            <h3>Merci, votre demande est bien partie.</h3>
            <p>Nous revenons vers vous rapidement pour échanger sur votre projet.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -20 }}>
            <div className="cform__types" role="radiogroup" aria-label="Type de projet">
              {types.map((t) => (
                <button
                  type="button"
                  key={t}
                  role="radio"
                  aria-checked={f.project_type === t}
                  className={`chip ${f.project_type === t ? 'is-on' : ''}`}
                  onClick={() => setF({ ...f, project_type: f.project_type === t ? '' : t })}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="cform__grid">
              <Field label="Nom & prénom" value={f.name} onChange={set('name')} required autoComplete="name" />
              <Field label="Téléphone" value={f.phone} onChange={set('phone')} type="tel" autoComplete="tel" />
              <Field label="E-mail" value={f.email} onChange={set('email')} type="email" autoComplete="email" className="span2" />
              <Field label="Parlez-nous de votre projet" value={f.message} onChange={set('message')} textarea required className="span2" />
            </div>
            <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
            {err && <p className="cform__err">{err}</p>}
            <div className="cform__foot">
              <small>Réponse rapide · Devis gratuit et sans engagement</small>
              <Magnetic>
                <button className="btn btn--red btn--lg" disabled={state === 'sending'}>
                  {state === 'sending' ? 'Envoi…' : 'Envoyer ma demande'} <Icon name="arrow" size={18} />
                </button>
              </Magnetic>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, textarea, className = '', ...p }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label className={`field ${className}`}>
      <Tag placeholder=" " rows={textarea ? 4 : undefined} {...p} />
      <span>
        {label}
        {p.required ? ' *' : ''}
      </span>
      <i />
    </label>
  );
}
