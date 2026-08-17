import React, { useState, useContext } from 'react';
import classroomApi from '../services/classroomApi';
import { AuthContext } from '../context/AuthContext';

export default function LectureUploader({ classroomId, onUploaded }) {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const submit = async () => {
    if (!file) return alert('Choose file');
    setUploading(true);
    try {
      await classroomApi.uploadFile({ id: classroomId, file, onProgress: p=>setProgress(p), token });
      setFile(null);
      setProgress(0);
      if (onUploaded) onUploaded();
      alert('Uploaded');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="p-4 border rounded">
      <label className="block text-sm font-medium text-gray-700">Upload Lecture / File</label>
      <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-2" />
      {uploading && <div className="mt-2">Uploading... {Math.round(progress)}%</div>}
      <div className="mt-3">
        <button onClick={submit} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
      </div>
    </div>
  );
}
