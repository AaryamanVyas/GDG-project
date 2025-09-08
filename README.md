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
![WhatsApp Image 2025-09-08 at 23 09 58_f6f91cbf](https://github.com/user-attachments/assets/1ff8cb7a-0e48-45da-91bb-4a762118369a)
![WhatsApp Image 2025-09-08 at 23 11 04_9c8996e8](https://github.com/user-attachments/assets/421be608-e0b6-420d-91d5-ff36d62e6fd0)
![WhatsApp Image 2025-09-08 at 23 11 19_ea227d4e](https://github.com/user-attachments/assets/076500bd-c9ca-4a56-a630-9fd238545d0e)
![WhatsApp Image 2025-09-08 at 23 11 30_895748f6](https://github.com/user-attachments/assets/1ec43aa3-9823-4b0c-8d34-9c024fef705c)
![WhatsApp Image 2025-09-08 at 23 11 43_50a8938f](https://github.com/user-attachments/assets/190bc757-85c2-4713-acd0-d5a1ece208d8)
![WhatsApp Image 2025-09-08 at 23 12 24_b1028bd2](https://github.com/user-attachments/assets/38349f7b-28dd-42fc-9b95-2996cd60021b)
![WhatsApp Image 2025-09-08 at 23 12 51_13a2a279](https://github.com/user-attachments/assets/cbe79183-e82e-481a-9573-d6e8e53f9969)
![WhatsApp Image 2025-09-08 at 23 13 16_d419aec2](https://github.com/user-attachments/assets/f6ea4ac1-0647-4d86-aa9b-f4b85e586e3e)




