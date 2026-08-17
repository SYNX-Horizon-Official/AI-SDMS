const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || 'mongodb://mongo:27017/ai-sdms';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

// Routes (existing routes presumed in other files)
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const attendanceRoutes = require('./routes/attendance.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
