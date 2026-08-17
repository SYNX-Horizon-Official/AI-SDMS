import React, { useEffect, useState, useContext, useRef } from 'react';
import classroomApi from '../services/classroomApi';
import { AuthContext } from '../context/AuthContext';
import socketClient from '../services/socketClient';

export default function ChatComponent({ classroomId }) {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!classroomId) return;
    (async ()=>{
      const msgs = await classroomApi.getMessages({ id: classroomId, token });
      setMessages(msgs);
    })();

    socketRef.current = socketClient.connect({ token });
    socketRef.current.emit('joinClass', { classroomId });
    socketRef.current.on('classroom:message', (m) => {
      setMessages(prev => [...prev, m]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveClass', { classroomId });
        socketRef.current.disconnect();
      }
    };
  }, [classroomId, token]);

  const send = async () => {
    if (!text) return;
    try {
      const m = await classroomApi.postMessage({ id: classroomId, token, text });
      setText('');
      // optimistic: socket will broadcast
    } catch (err) { console.error(err); }
  };

  return (
    <div className="border rounded p-3 h-full flex flex-col">
      <h3 className="font-semibold">Class Chat</h3>
      <div className="flex-1 overflow-auto my-2">
        {messages.map(m => (
          <div key={m._id} className={`mb-2`}>
            <div className="text-sm text-gray-600">{m.senderName || m.sender} • {new Date(m.createdAt).toLocaleTimeString()}</div>
            <div className="bg-gray-100 p-2 rounded">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full border rounded p-2"></textarea>
        <div className="mt-2 text-right">
          <button onClick={send} className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
