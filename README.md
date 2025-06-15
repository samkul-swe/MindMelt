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
- Search any computer science topic
- AI suggests relevant subtopics
- Difficulty levels from beginner to advanced

### 🤖 AI Learning Coach
- Asks strategic questions to guide discovery
- Adapts to your learning style
- Provides hints when you're stuck
- Tracks your progress and insights

### 📊 Learning Dashboard
- Track your learning streaks
- See progress across topics
- Get AI-generated learning summaries
- View recent activity and achievements

### 🛤️ Learning Paths
- **Conceptual Track**: Deep understanding of core concepts
- **Applied Track**: Practical implementation and examples  
- **Comprehensive Track**: Complete mastery with theory and practice

## 🛠️ Tech Stack

### Frontend
- **React** - User interface
- **React Router** - Navigation
- **Lucide React** - Icons
- **CSS3** - Styling with gradients and animations

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **JWT** - Authentication

### AI Integration
- **GMI API** - DeepSeek-Prover-V2 model
- **Custom prompting** - Socratic questioning system
- **Smart topic search** - AI-powered content discovery

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- GMI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindmelt.git
   cd mindmelt
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   PORT=3001
   
   # Frontend (.env)
   REACT_APP_AI_API_KEY=your_gmi_api_key
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from root directory)
   cd backend
   npm start
   
   # Start frontend (from frontend directory)
   cd frontend
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Use

1. **Sign up** for a MindMelt account
2. **Search** for any computer science topic
3. **Choose** your learning path (Conceptual, Applied, or Comprehensive)
4. **Start learning** through AI-guided questions
5. **Track progress** on your dashboard

## 🔧 Configuration

### AI Settings
Configure the AI behavior in `src/services/aiService.js`:

```javascript
const API_CONFIG = {
  model: "deepseek-ai/DeepSeek-Prover-V2-671B",
  temperature: 0.8,
  max_tokens: 400,
  top_p: 0.95
};
```

### Learning Paths
Customize learning approaches in the dashboard:
- **Conceptual**: Theory-focused questions
- **Applied**: Practical implementation
- **Comprehensive**: Balanced approach

## 📁 Project Structure

```
mindmelt/
├── backend/
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── styles/            # CSS files
│   └── package.json
└── README.md
```

## 🎨 Key Components

- **Dashboard**: Learning progress and session management
- **SearchBar**: AI-powered topic discovery
- **LearningSession**: Interactive Q&A interface
- **LearningSummary**: AI-generated progress insights

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_AI_API_KEY` | GMI API key for AI features | Yes |
| `PORT` | Backend server port | No (default: 3001) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Start your learning journey today!** 🚀

*MindMelt - Where curiosity meets code*