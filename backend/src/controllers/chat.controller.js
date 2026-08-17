const ClassMessage = require('../models/classmessage.model');

exports.postMessage = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Empty message' });
    const msg = await ClassMessage.create({ classroom: classroomId, sender: req.user.id, text });
    // Emit via socket.io if available
    if (req.app.io) req.app.io.to(`classroom_${classroomId}`).emit('classroom:message', msg);
    return res.json(msg);
  } catch (err) {
    console.error('postMessage', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { limit = 50, before } = req.query;
    const q = { classroom: classroomId };
    if (before) q.createdAt = { $lt: new Date(before) };
    const msgs = await ClassMessage.find(q).sort({ createdAt: -1 }).limit(parseInt(limit,10));
    return res.json(msgs.reverse()); // return oldest -> newest
  } catch (err) {
    console.error('getMessages', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
