const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function authFetch(url, opts = {}, token, onProgress) {
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (opts.body instanceof FormData) {
    // use fetch with progress not available in browsers easily; we'll use XHR for uploads
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method || 'POST', API_BASE + url);
      Object.keys(headers).forEach(k=>xhr.setRequestHeader(k, headers[k]));
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100); };
      xhr.onload = () => { if (xhr.status >=200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText)); else reject(xhr.responseText); };
      xhr.onerror = () => reject('Network error');
      xhr.send(opts.body);
    });
  }

  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const res = await fetch(API_BASE + url, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default {
  getClassroom: ({ id, token }) => authFetch(`/classrooms/${id}`, { method: 'GET' }, token),
  listFiles: ({ id, token }) => authFetch(`/classrooms/${id}/files`, { method: 'GET' }, token),
  uploadFile: async ({ id, file, onProgress, token }) => {
    const fd = new FormData();
    fd.append('file', file);
    return authFetch(`/classrooms/${id}/files`, { method: 'POST', body: fd }, token, onProgress);
  },
  getMessages: ({ id, token }) => authFetch(`/classrooms/${id}/messages`, { method: 'GET' }, token),
  postMessage: ({ id, token, text }) => authFetch(`/classrooms/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }, token)
};
