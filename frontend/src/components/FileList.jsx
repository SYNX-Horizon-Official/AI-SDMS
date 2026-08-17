import React from 'react';

export default function FileList({ files = [], classroomId }) {
  return (
    <div>
      <h3 className="font-semibold">Files</h3>
      {files.length === 0 ? <div className="text-gray-500">No files</div> : (
        <ul className="mt-2">
          {files.map(f => (
            <li key={f._id} className="border p-2 mb-2 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{f.originalName}</div>
                <div className="text-sm text-gray-500">{(f.size/1024|0)} KB • {new Date(f.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <a className="px-3 py-1 bg-gray-200 rounded" href={`/api/classrooms/${classroomId}/files/${f._id}/download`}>Download</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
