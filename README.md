# Mirai Nikki (未来日記) 🔮

> *"Every night you'll write tomorrow as though it has already happened. The version of you tonight plans. The version of you tomorrow executes."*

Mirai Nikki is a privacy-first, AI-assisted, mobile-first Progressive Web Application that helps you commit to tomorrow by writing tomorrow's achievements as though they have already happened.

Unlike traditional productivity applications that ask you to plan tomorrow using lists and reminders, Mirai Nikki asks you to narrate tomorrow in the past tense. The application then uses an invisible AI to transform your narrative into a structured execution plan.

## Screenshots

*(Add screenshots of your application here)*

<div align="center">
  <img src="docs/screenshots/onboarding.png" alt="Onboarding" width="200"/>
  <img src="docs/screenshots/write.png" alt="Write Screen" width="200"/>
  <img src="docs/screenshots/tomorrow.png" alt="Tomorrow Screen" width="200"/>
  <img src="docs/screenshots/archive.png" alt="Archive Screen" width="200"/>
</div>

## The Ritual ✨

Mirai Nikki is not a task manager or a second brain. It is a daily commitment device designed around a strict ritual:

1. **Write Tomorrow (Night):** Write the story of your success for the coming day as if it has already occurred.
2. **Seal Tomorrow:** Once you seal the diary, it cannot be edited or viewed until the next morning.
3. **Future Compiler (Invisible AI):** While you sleep, the app securely sends your journal to your chosen AI model to extract actionable tasks.
4. **Open Tomorrow (Morning):** At your set unlock time (e.g. 4:00 AM), your future arrives. You first read your "future memory", followed by the checklist generated from that memory.
5. **Execute:** Complete your tasks. Your completed days are saved beautifully in your Archive as chapters of a book.

## Philosophy & Privacy 🛡️

* **Local First:** Everything executes inside the browser. No backend, no accounts, no tracking.
* **Privacy First:** Your data lives strictly in your device's IndexedDB. The only network request is securely sent directly to your chosen AI Provider.
* **AI Second:** Artificial Intelligence is intentionally invisible. It exists solely to convert natural language into structured actions.

## Tech Stack 🛠️

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, pure CSS animations (no heavy animation libraries)
- **State Management:** Zustand
- **Database:** Dexie.js (IndexedDB)
- **AI Abstraction:** OpenRouter integration (pluggable architecture for future providers)
- **PWA:** Fully installable as a native-feeling app via `vite-plugin-pwa`

## Getting Started 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/cacheparadox/MiraiNikki.git
   cd MiraiNikki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Connect AI**
   Open the application and configure your OpenRouter API key during onboarding or in the Settings menu. The default model is `google/gemini-2.5-flash-pro`.

## Contributing 🤝
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please ensure that all features align strictly with the "Daily Ritual" philosophy outlined in the PRD.

## License 📄
[MIT](https://choosealicense.com/licenses/mit/)
