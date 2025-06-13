# Socratic CS Learning Platform

An adaptive learning app that uses AI-generated Socratic questioning to guide users through computer science concepts, never giving direct answers but helping users construct understanding through discovery.

## 🎯 Core Features

- **Preference-Based Learning Paths**: Choose between Conceptual, Applied, or Comprehensive tracks
- **Socratic Questioning Engine**: AI guides you with questions based on your responses
- **"Return to Basics" System**: Automatically guides users back to fundamentals when needed
- **Ice Cream Button 🍦**: Signal when you've reached thinking capacity for a helpful summary
- **Progress Tracking**: Visual progress indicators and session analytics

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or create a new React project:
```bash
npx create-react-app socratic-cs-learning
cd socratic-cs-learning
```

2. Install dependencies:
```bash
npm install lucide-react
npm install -D tailwindcss autoprefixer postcss @tailwindcss/typography
```

3. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

4. Replace the generated files with the provided code files:
   - Copy `App.js` content to `src/App.js`
   - Copy `index.js` content to `src/index.js`
   - Copy `index.css` content to `src/index.css`
   - Copy `tailwind.config.js` to project root
   - Copy `package.json` content (merge dependencies)

5. Create additional utility files:
   - Create `src/questionTrees.js` with the provided content
   - Create `src/socraticUtils.js` with the provided content

6. Start the development server:
```bash
npm start
```

## 📖 How It Works

### Learning Flow
1. **Choose Your Path**: Select Conceptual, Applied, or Comprehensive track
2. **Engage with Questions**: Answer in your own words (no copy-pasting!)
3. **Build Understanding**: Discover concepts through guided questioning
4. **Take Breaks**: Use the 🍦 button when you need to process information
5. **Track Progress**: Watch your understanding grow with visual progress indicators

### Question Tree System
The app uses a sophisticated question tree structure that:
- Matches user responses with expected patterns
- Provides fallback questions for unexpected answers
- Adapts difficulty based on user performance
- Implements Bloom's taxonomy for progressive learning

### Example User Journey (Euclidean Algorithm)
```
App: "What problem do you think the Euclidean algorithm solves?"
User: "Finding common factors?"
App: "Close! What's the biggest common factor of 12 and 8?"
User: "4"
App: "Perfect! So if we wanted the GREATEST common divisor, how would you find it?"
...continues with guided discovery...
```

## 🛠 Technical Architecture

### Frontend Stack
- **React**: Component-based UI framework
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Custom Hooks**: For state management and learning analytics

### Key Components
- `SocraticCSApp`: Main application component
- `questionTrees.js`: Question tree data structures
- `socraticUtils.js`: Learning logic and response analysis

### Question Tree Structure
```javascript
{
  node_id: {
    question: "What is...",
    responses: {
      "expected_answer": "next_node_id"
    },
    fallback: "fallback_node_id"
  }
}
```

### Response Matching Algorithm
1. **Direct Matching**: Exact keyword matches
2. **Fuzzy Matching**: Semantic variations and synonyms
3. **Fallback Logic**: Graceful handling of unexpected responses
4. **Confidence Scoring**: Quality assessment of matches

## 📚 Adding New Topics

To add a new computer science topic:

1. **Create Question Tree**: Define the learning path in `questionTrees.js`
```javascript
export const newTopic = {
  start: {
    question: "Your opening question...",
    responses: { /* expected responses */ },
    fallback: "fallback_node"
  },
  // ... more nodes
};
```

2. **Register Topic**: Add to `availableTopics` in `questionTrees.js`
```javascript
"new-topic": {
  name: "New Topic",
  description: "Learn about...",
  difficulty: "beginner",
  questionTree: newTopic,
  estimatedTime: "20-25 minutes"
}
```

3. **Update App**: Modify the main component to include topic selection

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for custom component styles
- Colors, fonts, and animations are all configurable

### Learning Paths
- Add new paths in `questionTrees.js`
- Customize path behavior in `socraticUtils.js`
- Each path can have different questioning styles and emphasis

### Question Styles
The app supports four questioning approaches:
- **Direct Explanation**: Straightforward questions
- **Scenario-Based**: Context-driven problems
- **Puzzle & Brain Teaser**: Engaging challenges
- **Analogy & Metaphor**: Conceptual comparisons

## 📊 Analytics & Progress Tracking

### Metrics Tracked
- Questions answered correctly/incorrectly
- Time spent per topic
- Learning path preferences
- Break patterns (ice cream button usage)
- Concept mastery progression

### Progress Visualization
- Linear progress bars
- Concept mastery indicators
- Session summaries
- Achievement celebrations

## 🔧 Development

### Project Structure
```
src/
├── App.js                 # Main application component
├── index.js              # Application entry point
├── index.css             # Global styles and Tailwind
├── questionTrees.js      # Topic question trees
└── socraticUtils.js      # Learning utilities
```

### Key Functions
- `findBestMatch()`: Response analysis
- `generateIceCreamSummary()`: Progress summaries
- `analyzeProgress()`: Learning analytics
- `adaptQuestionStyle()`: Personalization

### Testing
```bash
npm test                  # Run test suite
npm run test:coverage     # Coverage report
```

### Building for Production
```bash
npm run build            # Create production build
npm run serve            # Preview production build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically on commits

### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure redirects for SPA routing

### Traditional Hosting
1. Build: `npm run build`
2. Upload `build` folder contents to web server
3. Configure server for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add feature description"`
5. Push: `git push origin feature-name`
6. Submit pull request

## 📝 License

MIT License - feel free to use for educational purposes, hackathons, or commercial applications.

## 🎓 Educational Impact

This platform addresses key challenges in CS education:
- **Active Learning**: Students discover rather than memorize
- **Personalization**: Adapts to individual learning styles
- **Cognitive Load Management**: Ice cream button prevents overwhelm
- **Metacognition**: Students reflect on their learning process
- **Retention**: Discovery-based learning improves long-term retention

## 📞 Support

For questions, issues, or feature requests:
- Create GitHub issues for bugs and features
- Check existing documentation
- Review question tree examples for implementation patterns

---

**Happy Learning! 🧠✨**

*Remember: The goal isn't to give answers, but to guide discovery. Every question should help students think deeper, not just move forward.*