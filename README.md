# Mirai Nikki (Future Diary) 🔮

> *"Write your future, and watch it compile into reality."*

Mirai Nikki is a next-generation, AI-powered future diary and task manager. Instead of writing about what you did today, you write about what you *will* do tomorrow. 

Powered by large language models (like Gemini and Claude via OpenRouter) and a robust background compilation engine, Mirai Nikki parses your free-form narrative and automatically compiles it into a structured execution plan (tasks). 

## Features ✨

- **Future Journaling:** A distraction-free, beautifully themed editor (Warm Paper, Dark Ink) to write your intentions.
- **AI Task Compiler:** An offline-first, background task queue that intelligently extracts action items from your narrative.
- **Interactive Execution Plan:** Your compiled tasks map directly back to the sentences in your journal. Hover over a task to highlight the exact sentence that birthed it.
- **Immediate Task View:** Check your "Tomorrow's Tasks" today, or "Today's Tasks" when the day arrives. Add custom tasks on the fly.
- **Bring Your Own AI:** Plug in any OpenRouter API key and choose your preferred model to handle compilation.
- **Privacy First:** All journals and tasks are stored locally in your browser using IndexedDB.
- **PWA Ready:** Install Mirai Nikki to your home screen for a native app experience.

## Getting Started 🚀

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open your browser and go to `Settings` to input your OpenRouter API key.
5. Start writing your future!

## Technology Stack 🛠️

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, custom CSS variables for dynamic theming
- **State Management:** Zustand
- **Database:** Dexie.js (IndexedDB)
- **Icons:** Lucide React

## License 📄
MIT License
