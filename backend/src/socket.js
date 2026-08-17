const socketio = require('socket.io');

exports.init = (server, app) => {
  const io = socketio(server, { cors: { origin: '*', methods: ['GET','POST'] } });
  app.io = io;

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    socket.on('joinClass', ({ classroomId }) => {
      socket.join(`classroom_${classroomId}`);
    });
    socket.on('leaveClass', ({ classroomId }) => {
      socket.leave(`classroom_${classroomId}`);
    });
    socket.on('sendMessage', (payload) => {
      // payload should be { classroomId, message }
      io.to(`classroom_${payload.classroomId}`).emit('classroom:message', payload.message);
    });
    socket.on('disconnect', () => {
      // noop
    });
  });

  return io;
};
