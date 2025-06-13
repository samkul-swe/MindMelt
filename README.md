# CS Learning MVP - Interview Prep

A React-based web application for computer science interview preparation through adaptive questioning.

## Features

- **Adaptive Learning**: Questions get progressively harder based on performance
- **Multiple Learning Tracks**: Conceptual, Applied, and Comprehensive approaches
- **Various Question Types**: Socratic, Puzzle-based, and Role-play methods
- **Ice Cream Timer**: Focus timer that increases with correct answers (8-25 minutes)
- **Progress Tracking**: Track correct streaks and difficulty progression
- **Pseudocode Focus**: No syntax requirements, focus on logic building

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Create a new React app directory:**
   ```bash
   mkdir cs-learning-mvp
   cd cs-learning-mvp
   ```

2. **Initialize the project:**
   ```bash
   npx create-react-app . --template minimal
   ```

3. **Install dependencies:**
   ```bash
   npm install lucide-react tailwindcss postcss autoprefixer
   ```

4. **Initialize Tailwind CSS:**
   ```bash
   npx tailwindcss init -p
   ```

5. **Replace/Create the following files with the provided content:**
   - `package.json`
   - `src/App.js`
   - `src/App.css`
   - `src/index.js`
   - `src/index.css`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `public/index.html`

6. **Start the development server:**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

## Project Structure

```
cs-learning-mvp/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Application styles
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
└── postcss.config.js   # PostCSS configuration
```

## Current Topics Available

1. **Queues** - FIFO data structures (fully implemented)
2. **Binary Trees** - Tree structures (partially implemented)
3. **Sorting Algorithms** - Placeholder
4. **TCP/IP Basics** - Placeholder
5. **Process Management** - Placeholder

## Next Steps for Development

1. **Add ChatGPT Integration**: Replace mock assessment with actual AI evaluation
2. **Expand Question Bank**: Add more questions for all topics and difficulty levels
3. **User Authentication**: Add user accounts and progress saving
4. **Analytics**: Track learning patterns and performance metrics
5. **Video Integration**: Add video-based answer evaluation

## Technology Stack

- **Frontend**: React 18, Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS with custom orange/yellow theme

## License

This project is for educational purposes.