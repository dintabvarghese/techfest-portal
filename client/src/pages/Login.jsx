import React, { useState } from 'react';
import { api } from '../api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const user = await api('/auth/login', { method: 'POST', body: form });
      setStatus({ ok: true, text: `Welcome, ${user.name}!` });
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    }
  }

  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit">Login</button>
      </form>
      {status && <p className={`msg ${status.ok ? 'ok' : 'error'}`}>{status.text}</p>}
    </section>
  );
}
