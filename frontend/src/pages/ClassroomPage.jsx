import React, { useEffect, useState, useContext, useRef } from 'react';
import classroomApi from '../services/classroomApi';
import LectureUploader from '../components/LectureUploader';
import FileList from '../components/FileList';
import ChatComponent from '../components/ChatComponent';
import { AuthContext } from '../context/AuthContext';

export default function ClassroomPage({ match }) {
  const classroomId = match?.params?.id || '';
  const { token } = useContext(AuthContext);
  const [cls, setCls] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      try {
        const data = await classroomApi.getClassroom({ id: classroomId, token });
        setCls(data);
        const fl = await classroomApi.listFiles({ id: classroomId, token });
        setFiles(fl);
      } catch (err) { console.error(err); }
    })();
  }, [classroomId, token]);

  const onUploaded = async (f) => {
    const fl = await classroomApi.listFiles({ id: classroomId, token });
    setFiles(fl);
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-2xl font-semibold">{cls ? cls.title : 'Classroom'}</h1>
        <div className="mt-4">
          <LectureUploader classroomId={classroomId} onUploaded={onUploaded} />
        </div>
        <div className="mt-6">
          <FileList files={files} classroomId={classroomId} />
        </div>
      </div>

      <div className="col-span-1">
        <ChatComponent classroomId={classroomId} />
      </div>
    </div>
  );
}
