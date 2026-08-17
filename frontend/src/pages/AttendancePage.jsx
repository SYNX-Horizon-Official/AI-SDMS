import React, { useEffect, useState, useContext } from 'react';
import attendanceApi from '../services/attendanceApi';
import AttendanceTable from '../components/AttendanceTable';
import { AuthContext } from '../context/AuthContext';

export default function AttendancePage() {
  const { user, token } = useContext(AuthContext);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [batch, setBatch] = useState('');
  const [section, setSection] = useState('A');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load students for selected batch/section - placeholder
    // In real app, call /api/users?role=student&batch=... endpoint
  }, [batch, section]);

  const handleFetchClass = async () => {
    if (!subjectId) return alert('Select subject');
    setLoading(true);
    try {
      const recs = await attendanceApi.getClassAttendance({ subjectId, date, batch, section, token });
      setStudents(recs);
    } catch (err) {
      console.error(err);
      alert('Failed to load class attendance');
    } finally { setLoading(false); }
  };

  const handleSave = async (records) => {
    setLoading(true);
    try {
      await attendanceApi.markAttendance({ subjectId, date, batch, section, classTime: '', records, topic: '' , token});
      alert('Attendance saved');
      setStudents(await attendanceApi.getClassAttendance({ subjectId, date, batch, section, token }));
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Attendance</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input placeholder="Subject ID" value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Batch (e.g., BSIT-2023)" value={batch} onChange={e=>setBatch(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Section" value={section} onChange={e=>setSection(e.target.value)} className="p-2 border rounded" />
      </div>

      <div className="mt-4">
        <button onClick={handleFetchClass} className="px-4 py-2 bg-blue-600 text-white rounded">Load Class</button>
      </div>

      <div className="mt-6">
        <AttendanceTable students={students} onSave={handleSave} loading={loading} />
      </div>
    </div>
  );
}
