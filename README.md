# MindMelt 🧠

**Learn computer science through AI conversations, not boring tutorials.**

MindMelt uses AI to teach computer science through questions, not lectures. Choose any topic and discover answers through conversation. Learn by thinking, not memorizing.

## ✨ What Makes MindMelt Different

- **No tutorials** - Just smart questions that make you think
- **Any CS topic** - From algorithms to web development
- **AI-powered** - Personalized learning that adapts to you
- **Socratic method** - Discover answers through guided conversation
- **Real understanding** - Learn concepts, not just facts

## 🚀 Features

### 🎯 Smart Topic Search
- Search any computer science topic with AI-powered suggestions
- Get exactly 5 relevant topics for any search query
- Difficulty levels from beginner to advanced
- Categories include: Programming Languages, Web Development, AI/ML, Databases, Cybersecurity, and more

### 🤖 AI Learning Coach
- **Socratic Questioning**: Strategic questions that guide discovery
- **Multiple Styles**: Socratic, Scenario-based, Puzzle, and Analogy approaches
- **Bloom's Taxonomy**: Progressive learning from Remember → Understand → Apply → Analyze → Evaluate → Create
- **Adaptive Responses**: Personalized based on your understanding level
- **Hint System**: 3 hints per topic to help when you're stuck

### 📊 Learning Dashboard
- **Orange Theme**: Beautiful, consistent design throughout
- **Progress Tracking**: View learning streaks, completion rates, and activity
- **Custom Display Names**: Set and update your display name
- **Session Management**: Continue previous sessions or start new ones
- **Analytics**: Daily summaries and learning insights (for registered users)

### 🛤️ Learning Paths
- **Conceptual Track** 🧠: Deep understanding of core concepts and theory
- **Applied Track** ⚡: Practical implementation and real-world examples
- **Comprehensive Track** 🎯: Complete mastery with theory and practice combined

### 🍦 Ice Cream Timer
- **Focus Sessions**: Visual timer that melts as time passes
- **Progress Rewards**: Good answers help refreeze your ice cream and extend time
- **Gamification**: Makes learning sessions engaging and time-bounded

## 🏗️ Architecture

### Frontend (React)
```
frontend/src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom hooks (useApiKey, useTopicSearch)
├── pages/              # Main pages (Dashboard, LearningSession)
├── services/           # API services (now calls backend)
└── styles/             # CSS with orange theme
```

### Backend (Node.js/Express)
```
backend/
├── server.js           # Main Express server
├── services/           # AI service (handles Gemini API calls)
└── utils/              # Firestore utilities
```

### AI Service Architecture
- **Backend Integration**: All AI calls now happen server-side for better security
- **Same Prompts**: No changes to existing prompts or model settings
- **Enhanced Security**: API keys handled server-side only
- **Better Monitoring**: All AI requests can be logged and monitored

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side navigation
- **Lucide React** - Beautiful, consistent icons
- **CSS3** - Custom orange theme with gradients and animations
- **JWT Authentication** - Secure token-based auth

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Firestore** - Database (via Admin SDK)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **node-fetch** - HTTP requests to AI APIs

### AI & External APIs
- **GMI API** - DeepSeek-Prover-V2-671B model for advanced CS reasoning
- **Custom Prompting System** - Socratic questioning with Bloom's taxonomy
- **Backend AI Service** - All AI calls moved to backend for security

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** 
- **npm or yarn**
- **GMI API key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindmelt.git
   cd mindmelt
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   JWT_SECRET=your-jwt-secret-key-here
   # Optional: Default AI API key
   AI_API_KEY=your_gmi_api_key_here
   ```
   
   **Frontend** (`frontend/.env`):
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3001
   # Optional: Frontend AI API key (users can set their own)
   REACT_APP_AI_API_KEY=your_gmi_api_key_here
   ```

4. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Use

### For New Users
1. **Visit** http://localhost:3000
2. **Start Learning** - Click \"Start Learning\" for anonymous session
3. **Search Topics** - Find any computer science topic
4. **Choose Learning Path** - Select your preferred approach
5. **Learn Through Questions** - Engage with AI through Socratic dialogue
6. **Create Account** - Save progress and unlock advanced features

### For Registered Users
1. **Sign Up/Login** - Create account for progress tracking
2. **Dashboard** - View learning analytics and continue sessions
3. **Profile Settings** - Customize display name and view account info
4. **Session Management** - Resume previous sessions or start new ones
5. **Progress Tracking** - Monitor streaks, completions, and daily summaries

## ⚙️ Configuration

### AI Model Settings
Located in `backend/services/aiService.js`:
```javascript
const API_CONFIG = {
  model: \"deepseek-ai/DeepSeek-Prover-V2-671B\", // GMI model
  temperature: 0.8,
  max_tokens: 400,
  stream: false,
  top_p: 0.95,
  top_k: 40
};
```

### Learning Configuration
- **Timer Settings**: 8-minute initial sessions, up to 25 minutes max
- **Hint System**: 3 hints per topic, resets on new topics
- **Question Styles**: 4 different approaches available
- **Progress Thresholds**: Customizable quality scoring

## 🔐 Security & Privacy

### Data Protection
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **API Key Security**: All AI API keys handled server-side
- **Input Validation**: All user inputs validated and sanitized
- **CORS Protection**: Configured for frontend-backend communication

### User Privacy
- **Anonymous Learning**: Users can learn without creating accounts
- **Data Minimization**: Only essential fields stored in database
- **Local Storage**: API keys stored locally when user-provided
- **No Tracking**: No analytics or tracking beyond learning progress

## 📊 Database Schema

### User Model (Firestore)
```javascript
{
  id: \"auto-generated\",
  username: \"string (lowercase, unique)\",
  email: \"string (optional)\", 
  password: \"string (hashed)\",
  name: \"string (display name, optional)\", // Added when user customizes
  sessionsCompleted: \"number\",
  totalQuestions: \"number\", 
  averageScore: \"number\",
  createdAt: \"timestamp\",
  updatedAt: \"timestamp\"
}
```

### Session Model (Firestore)
```javascript
{
  id: \"auto-generated\",
  userId: \"string\",
  topicName: \"string\",
  difficulty: \"string\",
  category: \"string\", 
  questionsAsked: \"number\",
  correctAnswers: \"number\",
  duration: \"number (seconds)\",
  completed: \"boolean\",
  learningPath: \"string\",
  createdAt: \"timestamp\",
  updatedAt: \"timestamp\"
}
```

## 🎨 Theme & Styling

### Orange Theme Implementation
- **Primary Color**: `#FF6B35` (MindMelt Orange)
- **Gradients**: `linear-gradient(135deg, #FF8A56 0%, #FF6B35 50%, #FF4D6D 100%)`
- **Consistent Design**: All components follow orange theme
- **Accessibility**: Proper contrast ratios maintained
- **Responsive**: Mobile-first design approach

### Key Style Features
- **Glass Morphism**: Backdrop blur effects on modals
- **Smooth Animations**: CSS transitions and keyframe animations
- **Gradient Backgrounds**: Beautiful orange-themed gradients
- **Icon Integration**: Lucide React icons throughout
- **Custom Components**: Reusable styled components

## 🔄 AI Service Migration

The AI service has been completely migrated from frontend to backend:

### What Changed
- **All AI API calls** now happen on the backend server
- **Frontend calls** now go to `/api/ai/*` endpoints
- **Same functionality** - no changes to user experience
- **Enhanced security** - API keys handled server-side
- **Better monitoring** - all requests logged

### API Endpoints
- `POST /api/ai/socratic-response` - Get Socratic responses
- `POST /api/ai/hint-response` - Get learning hints
- `POST /api/ai/assess-understanding` - Assess user understanding
- `POST /api/ai/search-topics` - Search CS topics
- `POST /api/ai/topic-details` - Get topic details
- `POST /api/ai/test-key` - Test API key
- `POST /api/ai/validate-key` - Validate API key format

## 🐛 Troubleshooting

### Common Issues

**Username Update Fails**
- Check browser console for detailed error messages
- Verify you're logged in with a valid session
- Try logging out and back in to refresh tokens

**Invalid Date Display**
- Dates are now handled robustly with fallbacks
- \"N/A\" shown for invalid/missing dates
- Supports all Firestore timestamp formats

**AI Responses Not Working**
- Verify GMI API key is set correctly
- Check backend logs for detailed error information
- Ensure backend server is running on port 3001

**Search Not Finding Topics**
- AI-powered search requires valid API key
- Try broader search terms first, then narrow down
- Check network connection and backend status

### Debug Information
- **Frontend**: Open browser dev tools for detailed logs
- **Backend**: Check terminal output for request/response logs
- **Database**: Firestore operations logged with full details
- **AI Calls**: Complete request/response logging implemented

## 📝 Development Notes

### Recent Improvements
1. **AI Service Migration**: Moved all AI calls to backend for security
2. **Orange Theme**: Complete dashboard redesign with consistent branding
3. **Username Management**: Full display name customization with real-time updates
4. **Date Handling**: Robust Firestore timestamp parsing with graceful fallbacks
5. **Error Handling**: Comprehensive error messages and debug logging
6. **Field Cleanup**: Removed redundant database fields for new users
7. **Enhanced UX**: Success animations, loading states, and clear feedback

### Code Quality
- **Consistent Patterns**: Standardized API calls and error handling
- **Component Reusability**: Shared components with proper prop interfaces
- **Type Safety**: Input validation and error boundary handling
- **Performance**: Optimized re-renders and efficient state management
- **Accessibility**: Proper ARIA labels, semantic HTML, keyboard navigation

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Set production API keys and database URLs
2. **Build Frontend**: `npm run build` in frontend directory
3. **Server Configuration**: Configure reverse proxy (nginx) if needed
4. **Database**: Ensure Firestore is properly configured with security rules
5. **Monitoring**: Set up logging and error tracking for production

### Security Checklist
- [ ] JWT secrets are strong and secure
- [ ] API keys are not exposed in frontend code
- [ ] CORS is properly configured for your domain
- [ ] Rate limiting implemented for API endpoints
- [ ] Input validation on all user inputs
- [ ] HTTPS enabled in production

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** following existing patterns
4. **Test thoroughly** on both frontend and backend
5. **Update documentation** if needed
6. **Submit PR** with clear description

### Coding Standards
- **ES6+** syntax throughout
- **React Hooks** for state management
- **CSS Variables** for theming
- **Console Logging** for debugging
- **Error Handling** for all async operations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔥 Getting Started Right Now

**Ready to learn? Here's the fastest path:**

1. **Clone & Install** (2 minutes)
   ```bash
   git clone [repo] && cd mindmelt
   cd backend && npm install && cd ../frontend && npm install
   ```

2. **Set API Key** (1 minute)
   ```bash
   echo \"REACT_APP_AI_API_KEY=your_gmi_key\" > frontend/.env
   ```

3. **Launch** (30 seconds)
   ```bash
   cd backend && npm start &
   cd frontend && npm start
   ```

4. **Learn** (∞ possibilities)
   - Visit http://localhost:3000
   - Search \"algorithms\" or any CS topic
   - Start your Socratic learning journey!

**Start your learning journey today!** 🚀

*MindMelt - Where curiosity meets code*
