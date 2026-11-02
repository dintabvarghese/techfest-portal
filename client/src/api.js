const BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: 'include', // send/receive the httpOnly cookie
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
  return data;
}
