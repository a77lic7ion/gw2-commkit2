# GW2 CommKit: AI-Powered Meta-Event Planner

GW2 CommKit is an advanced, web-based toolkit for Guild Wars 2 commanders and players. It leverages the power of the Google Gemini API to generate optimized meta-event schedules ("trains") and provides a real-time, interactive timetable for all major in-game events.

> Image placeholder: A screenshot of the main toolkit page showing the timeline graph and the event list would be ideal here.

---

## ✨ Features

- **🤖 AI-Powered Run Generation**: Instantly create optimized 4-hour meta-event schedules using the Google Gemini API. Choose from different "train" types (morning, evening, etc.) to get a run tailored to your play schedule.
- **⏰ Live Timetable Sync**: Pull a real-time schedule of all upcoming world bosses, Heart of Thorns metas, and other major events based on the reliable `gw2.ninja` timer data.
- **📊 Interactive Timeline Graph**: Get a visual overview of your entire session. The graph shows all events laid out chronologically, with a "NOW" marker indicating the current time.
- **Event List**: View upcoming events in a clean list, grouped by category. Each event shows:
  - A countdown timer to its start.
  - An "Active for" timer and progress bar when it's live.
  - An upcoming event progress bar indicating when it's about to start (within 15 mins).
  - A one-click button to copy the waypoint chat link.
- **✏️ Full Schedule Customization**: Take control of your run. You can add custom events, edit existing ones, or delete any event from the schedule.
- **💾 Save & Load Runs**: Save your favorite generated or customized runs to your local profile. Load them anytime to get right back into the action.
- **❤️ Favorite Events**: Mark any event as a favorite. The "Favorites" tab will then show you a personalized schedule of only the upcoming instances of your chosen events.
- **⚙️ Settings & API Flexibility**:
  - A simple, email-based user profile system stored locally.
  - Flexibility to switch between Google Gemini and OpenAI for AI generation.
- **📱 Modern, Responsive UI**: Built with React and Tailwind CSS for a clean, intuitive, and responsive experience on any device.

---

## 🛠️ Core Technologies

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini API](https://ai.google.dev/) via `@google/genai`
- **Data**: Static event timer data adapted from the [gw2.ninja project](https://gw2.ninja/timer).
- **Icons**: [Themify Icons](https://themify.me/themify-icons)

---

## 🚀 How It Works

GW2 CommKit provides two primary methods for creating an event schedule:

### 1. AI Generation (Commander Toolkit)

When you select a "Meta Train" to generate, the application sends a detailed prompt to the Google Gemini API. This prompt instructs the AI to act as a Guild Wars 2 expert and create a unique, sequential, and non-overlapping 4-hour event schedule.

The prompt specifies the exact start time and desired JSON output format, ensuring the response can be directly parsed and displayed by the application. This allows for creative and varied event runs that go beyond static timers.

### 2. Live Timetable Sync

The "Pull Live Data" feature uses a large, built-in data object (`GW2_NINJA_TIMER_DATA`) that contains the sequences and durations for all major repeatable events in the game.

The `calculateSchedule` function processes this data in real-time:

1. It determines the start of the current UTC day.
2. It calculates the base start time for each event's pattern by accounting for any partial, non-repeating sequences.
3. It projects the repeating pattern forward in time from this base.
4. It filters for events occurring within the next few hours and displays them in chronological order.

This ensures the app is always in sync with the official in-game event cycles without needing a constant backend connection.

---

## 🔧 Setup & Usage

This is a frontend-only application that runs entirely in your browser.

### User Profile

- The first time you open the app, you will be asked to register with an email address.
- This creates a local profile in your browser's `localStorage` to save your runs, favorites, and settings. No data is sent to a server.

### API Key Configuration

The AI generation features require an API key.

- **Google Gemini (Default)**: The application is configured to use the Google Gemini API. It expects the API key to be available as an environment variable (`process.env.API_KEY`).
- **OpenAI (Optional)**: If you prefer to use OpenAI's models, you can:
    1. Navigate to the **Settings** tab.
    2. Select "OpenAI" from the provider dropdown.
    3. Enter your OpenAI API key into the input field and save.

---

## 📁 File Structure

- `index.html`: The single HTML file entry point. It loads Tailwind CSS, Themify Icons, and the main application script.
- `index.tsx`: The core of the application. This file contains all the React components, state management (`useState`, `useContext`), application logic, helper functions, and API call handlers.
- `metadata.json`: Basic metadata for the application.
- `README.md`: This file.

---

## Credits

Created by Shaun Gordon, AfflictedAI, 2025.

Event timer data structure is based on the invaluable work done by the [gw2.ninja](https://gw2.ninja/) project.
