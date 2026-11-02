import React, { useState } from 'react';
import { api } from '../api.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api('/auth/register', { method: 'POST', body: form });
      setStatus({ ok: true, text: 'Registered! You can log in now.' });
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    }
  }

  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password (min 6)" value={form.password} onChange={onChange} required />
        <button type="submit">Register</button>
      </form>
      {status && <p className={`msg ${status.ok ? 'ok' : 'error'}`}>{status.text}</p>}
    </section>
  );
}
