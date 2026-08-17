const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function authFetch(url, opts = {}, token) {
  const headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + url, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'API error');
  }
  return res.json();
}

export default {
  markAttendance: ({ subjectId, date, batch, section, classTime, records, topic, token }) =>
    authFetch('/attendance/mark', { method: 'POST', body: JSON.stringify({ subjectId, date, batch, section, classTime, records, topic }) }, token),

  getClassAttendance: ({ subjectId, date, batch, section, token }) =>
    authFetch(`/attendance/class?subjectId=${encodeURIComponent(subjectId)}&date=${encodeURIComponent(date)}&batch=${encodeURIComponent(batch)}&section=${encodeURIComponent(section)}`, { method: 'GET' }, token),

  getStudentAttendance: ({ studentId, from, to, token }) =>
    authFetch(`/attendance/student/${encodeURIComponent(studentId)}?from=${from||''}&to=${to||''}`, { method: 'GET' }, token),

  getStats: ({ studentId, subjectId, token }) =>
    authFetch(`/attendance/stats?studentId=${encodeURIComponent(studentId)}${subjectId ? `&subjectId=${encodeURIComponent(subjectId)}` : ''}`, { method: 'GET' }, token)
};
