.

📘 FlashMaster – Flashcards & Quiz App

A React Native (Expo) flashcards app with AI-powered quiz generation.
Users can create decks, add cards, and test themselves with multiple-choice quizzes.
The app tracks progress, streaks, and rewards coins for correct answers.

✨ Features

📂 Deck Management – Create, view, and delete decks of flashcards.

📝 Add Cards – Add Q/A cards to each deck.

🤖 AI Quiz Generation – Automatically generate quizzes from deck content using OpenRouter
.

🛡️ Fallback Quiz – If AI fails, the app generates default MCQs.

📊 Progress Tracking – Tracks score, streaks, best streak, and past attempts.

🪙 Rewards System – Earn coins for correct answers.

🎨 Clean UI – Dark-themed design for focus.

📱 Expo Router Navigation – Tab navigation (My Decks, Progress).

💾 Persistent Storage – Quiz attempts are saved locally with AsyncStorage.

🛠️ Tech Stack

React Native
 (Expo)

expo-router

AsyncStorage

OpenRouter API
 (AI-powered quiz generation)

Context API for global state management

📂 Project Structure
flashmaster/
│
├── app/
│   ├── index.tsx           # Home / My Decks screen
│   ├── progress.tsx        # Progress tracking screen
│   ├── deck/[id]/          # Deck details & quiz routes
│   │   └── quiz.tsx        # QuizScreen (AI + fallback)
│   └── _layout.tsx         # Expo Router layout
│
├── context/
│   └── AppProvider.tsx     # Global state (decks, coins, theme, records)
│
├── assets/                 # Images, icons, etc.
│
├── README.md               # Project documentation
└── package.json

⚡ Getting Started
1️⃣ Clone & Install
git clone https://github.com/yourusername/flashmaster.git
cd flashmaster
npm install

2️⃣ Setup Environment Variables

Create a .env file in the root:

OPENROUTER_API_KEY=your_api_key_here


You can get a free key from OpenRouter
.

3️⃣ Run the App

Start the Expo dev server:

npx expo start


Open on your phone with the Expo Go app or run on an emulator.

🧩 Usage

Create a deck → Add a title.

Add flashcards → Each card has a question & answer.

Start a quiz → AI will generate MCQs from your cards.

If AI fails, a fallback quiz is generated.

Answer questions → Get feedback instantly.

Track your progress → View scores, streaks, and coins in the Progress tab.

🔑 API Keys

OpenRouter API Key required for AI quiz generation.

Without a key, the app still works using fallback MCQs.

📸 Screenshots (Optional)

Add screenshots here once you have them.

🧪 Future Improvements

Add themes (light/dark)

Deck sharing/import/export

Leaderboard for coins & streaks

Smarter AI prompt tuning for more accurate MCQs
