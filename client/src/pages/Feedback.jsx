import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

// Step 4 demo switch. true = VULNERABLE (renders raw HTML), false = SAFE.
const VULNERABLE = import.meta.env.VITE_VULNERABLE_XSS === 'true';

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api('/feedback').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/feedback', { method: 'POST', body: { message } });
      setMessage('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Feedback</h2>
      <form onSubmit={onSubmit}>
        <textarea
          rows="3"
          placeholder="Write your feedback…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="msg error">{error}</p>}

      <ul className="feedback">
        {items.map((f) =>
          VULNERABLE ? (
            // BEFORE (vulnerable): text is inserted as HTML, so injected tags/events run
            <li key={f._id} dangerouslySetInnerHTML={{ __html: f.message }} />
          ) : (
            // AFTER (safe): React escapes the text and shows it as plain text
            <li key={f._id}>{f.message}</li>
          )
        )}
      </ul>
    </section>
  );
}
