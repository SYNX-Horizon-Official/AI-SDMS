# AI-SDMS: AI-Powered Smart Exam Management System

## 🎯 Overview

AI-SDMS is a comprehensive Student Data Management System with AI-powered exam generation, intelligent semantic grading, and secure exam proctoring. Built for educational institutions to manage students, faculty, exams, and academic records.

## 📋 Core Features

### Authentication & Authorization
- ✅ Multi-role authentication (Student, Faculty, HOD)
- ✅ Student ID & Email login
- ✅ Password management & reset
- ✅ JWT-based session management

### Student Management
- ✅ Bulk import via Excel/CSV
- ✅ Student profiles with documents
- ✅ Profile pictures & ID cards
- ✅ Academic history tracking

### Faculty Management
- ✅ Faculty profiles & qualifications
- ✅ Subject assignment
- ✅ Class assignments
- ✅ Leave & application tracking

### Academic Management
- ✅ Batch & Section management
- ✅ Subject management
- ✅ Timetable creation (manual & upload)
- ✅ Attendance system with eligibility checks

### Classroom/LMS
- ✅ Subject-specific classrooms
- ✅ Lecture file sharing (PDF, PPT, Word)
- ✅ Real-time chat
- ✅ Assignment submission
- ✅ Quiz system

### AI-Powered Exam System
- ✅ AI exam generation from lectures
- ✅ MCQ auto-generation
- ✅ Short & long question generation
- ✅ Expected answers & keywords
- ✅ Semantic grading criteria
- ✅ Teacher review & approval workflow

### Secure Exam Interface
- ✅ Kiosk mode (fullscreen, focus-locked)
- ✅ Tab-switching prevention
- ✅ Copy/paste restriction
- ✅ Keyboard shortcut blocking
- ✅ Exam timer with autosave
- ✅ Network interruption recovery

### Exam Features
- ✅ MCQ phase with dedicated timer
- ✅ Written questions phase
- ✅ Math tools (Greek symbols, derivatives, matrices)
- ✅ Diagram/drawing tool
- ✅ Invigilator recording
- ✅ Automatic exam attendance

### AI Semantic Grading
- ✅ Concept-based evaluation
- ✅ Keyword matching
- ✅ Partial marks calculation
- ✅ AI-suggested scores
- ✅ Teacher review & approval
- ✅ AI grading reports

### Results & Reporting
- ✅ Result publishing workflow
- ✅ Marksheet generation
- ✅ Transcript management
- ✅ Performance reports (PDF/Excel)
- ✅ Class performance analytics
- ✅ Faculty activity tracking

### FYP System
- ✅ Student FYP dashboard
- ✅ AI-assisted proposal discussion
- ✅ Supervisor assignment
- ✅ Progress tracking
- ✅ HOD monitoring

### AI Assistant
- ✅ Subject-aware chatbot
- ✅ Study recommendations
- ✅ Topic explanations
- ✅ Learning material recommendations
- ✅ Privacy-restricted access

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **AI**: Ollama (local)
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Chart Library**: Chart.js
- **Rich Editor**: TipTap
- **Math Editor**: MathLive
- **Drawing**: Canvas API

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Local Server**: Ollama

## 📁 Project Structure

```
AI-SDMS/
├── backend/
│   ├── src/
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, validation
│   │   ├── services/         # External services
│   │   ├── utils/            # Helpers
│   │   └── config/           # Configuration
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API integration
│   │   ├── context/          # Global state
│   │   ├── hooks/            # Custom hooks
│   │   ├── styles/           # Tailwind CSS
│   │   └── utils/            # Utilities
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)
- Ollama (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashyan-Official/AI-SDMS.git
   cd AI-SDMS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Docker Setup (Optional)**
   ```bash
   docker-compose up -d
   ```

## 📊 Database Schema

### User Models
- User (base model with roles)
- Student (extends User)
- Faculty (extends User)
- HOD (extends User)

### Academic Models
- Batch
- Section
- Subject
- Class
- Enrollment

### Exam Models
- Exam
- Question
- ExamAttempt
- Answer
- GradingCriteria

### Additional Models
- Attendance
- Assignment
- Quiz
- FYPProposal
- Notification

## 🔐 Security Features

- JWT authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- Data encryption
- SQL/NoSQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Exam proctoring (kiosk mode)

## 🌐 Deployment

### Local Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
- Backend: AWS EC2, Heroku, DigitalOcean
- Frontend: Vercel, Netlify
- Database: MongoDB Atlas
- File Storage: AWS S3

## 📝 API Documentation

API endpoints follow RESTful conventions:

```
GET    /api/auth/login
POST   /api/auth/register
GET    /api/students
POST   /api/students
GET    /api/exams
POST   /api/exams
GET    /api/exams/:id/questions
POST   /api/exams/:id/attempts
```

## 🤖 AI Integration

### Ollama Setup
```bash
curl https://ollama.ai/install.sh | sh
ollama pull mistral
ollama serve
```

### AI Features
- Exam generation from lectures
- Question generation
- Answer key generation
- Semantic grading
- Student chatbot
- Recommendations

## 📱 Mobile Support

- Responsive design
- Mobile-friendly UI
- Touch-optimized interfaces
- Offline support (planned)

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please follow the contribution guidelines.

## 📞 Support

For issues and questions, please create an issue on GitHub.

## 🗺️ Roadmap

- [ ] Phase 1-3: Core Authentication & Management (In Progress)
- [ ] Phase 4-6: Attendance, LMS, Assignments
- [ ] Phase 7-9: AI Exams & Secure Interface
- [ ] Phase 10-12: Grading & FYP
- [ ] Phase 13-14: AI Assistant & Deployment

---

**Built with ❤️ for educators and students**
