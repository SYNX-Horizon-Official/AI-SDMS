import React, { useState } from 'react';

export default function AttendanceTable({ students = [], onSave, loading }) {
  const [records, setRecords] = useState(() => students.map(s => ({ studentId: s.studentId || s.studentId, status: s.status || 'present', studentObjectId: s.student || null })));

  React.useEffect(() => {
    setRecords(students.map(s => ({ studentId: s.studentId, status: s.status || 'present', studentObjectId: s.student || null })));
  }, [students]);

  const update = (idx, field, value) => {
    const copy = [...records];
    copy[idx] = { ...copy[idx], [field]: value };
    setRecords(copy);
  };

  return (
    <div>
      {records.length === 0 ? <div className="text-gray-500">No students loaded</div> : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Student ID</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.studentId} className="border-t">
                <td className="px-4 py-2">{r.studentId}</td>
                <td className="px-4 py-2">
                  <select value={r.status} onChange={e=>update(i,'status',e.target.value)} className="p-1 border rounded">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="leave">Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4">
        <button disabled={loading} onClick={()=>onSave(records)} className="px-4 py-2 bg-green-600 text-white rounded">Save Attendance</button>
      </div>
    </div>
  );
}
