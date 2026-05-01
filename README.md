# 🔌 QuizCraft

> 🎯 *Ace your Emerging Trends in Electronics exam with AI-powered quizzes*

![Status](https://img.shields.io/badge/status-live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🧠 **218 Real Questions** — All questions sourced from the actual Emerging Trends in Electronics curriculum
- ⏱️ **Timed Quizzes** — 60 seconds per question with auto-advance
- 📊 **Chapter-wise Tracking** — See your performance across 3 chapters
- 🎯 **Weak Topic Detection** — Automatically identifies topics you need to work on
- 🔄 **Smart Retests** — Re-quiz only the topics you struggled with
- 🏆 **Leaderboard** — Compete with your peers
- 🌙 **Dark Mode Only** — Easy on the eyes during late-night study sessions
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 📚 Subject Coverage

### Emerging Trends in Electronics

| Chapter | Topic | Questions |
|---------|-------|-----------|
| 1 | Advanced Processors and Technology | ~72 |
| 2 | AI and Machine Learning | ~74 |
| 3 | ESP32 Microcontroller | ~72 |

**Total: 218 Questions**

---

## 🚀 Quick Start

### Live Demo
👉 **https://study-platform-peach-iota.vercel.app**

### Run Locally

```bash
# Clone the repo
git clone https://github.com/aayush-bhat07/quizcraft.git
cd quizcraft

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🎮 How It Works

### 1️⃣ Enter Your Name
Just type your name and hit **Start Quiz** — no sign-up required.

### 2️⃣ Choose Your Quiz Settings
- Select number of questions: **10 / 25 / 50 / All**
- Choose chapters to include
- Timer: **60 seconds per question**

### 3️⃣ Take the Quiz
- Read each question carefully
- Select A, B, C, or D
- Timer auto-advances if you take too long
- Progress bar shows where you are

### 4️⃣ Get Your Results
- 📈 **Score breakdown** by chapter
- 🎯 **Weak topics** highlighted automatically  
- ✅ **Review wrong answers** with correct answers explained
- 🔄 **One-click retest** on weak areas

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe code |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Pre-built UI components |
| **Vercel** | Free hosting & auto-deploy |
| **LocalStorage** | No backend needed — all data stored locally |

---

## 📁 Project Structure

```
study-platform/
├── app/
│   ├── page.tsx           # Home — subject selection & name input
│   ├── quiz/[subject]/    # Quiz engine with timer
│   ├── results/[attemptId]/ # Results & weak topic analysis
│   └── leaderboard/       # Rankings
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── QuizEngine.tsx     # Core quiz logic
│   └── QuestionCard.tsx   # Question display component
├── data/
│   └── questions.json     # All 218 ETE questions
├── lib/
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

---

## 🎨 Design System

**Color Palette:**
- 🖤 Background: `#1D1E2C` (deep dark)
- 💜 Primary: `#AC9FBB` (muted purple-lilac)
- 🤍 Light: `#F7EBEC` (off-white)
- 💗 Muted: `#DDBDD5` (soft pink)
- ✅ Success: `#81c784` (green)
- ❌ Error: `#e57373` (soft red)

**Typography:**
- Headlines: **Lexend** (readability-focused)
- Body: **Inter** (clean, modern)

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/quizcraft.git`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Make changes** and **commit**: `git commit -m "Add something cool"`
5. **Push**: `git push origin feature/your-feature`
6. **Open a PR** on GitHub

---

## ⚠️ Known Issues

- Second PDF question extraction had OCR corruption — Subject 2 questions are incomplete. **Only Emerging Trends in Electronics (218 questions) is fully functional.**
- Leaderboard shows mock data until more users take quizzes

---

## 📈 Future Roadmap

- [ ] Add more subjects
- [ ] Firebase auth for persistent leaderboard
- [ ] Spaced repetition algorithm
- [ ] Voice quiz mode
- [ ] Mobile app (React Native)
- [ ] PDF export of results

---

## 👨‍💻 Author

Built with 💜 by **Aayush Bhat** — diploma student, aspiring builder, and always shipping.

- 🔗 LinkedIn: [aayush-bhat07](https://linkedin.com/in/aayush-bhat07)
- 🐙 GitHub: [aayush-bhat07](https://github.com/aayush-bhat07)

---

## 📄 License

MIT © Aayush Bhat — feel free to use, modify, and distribute.

---

*Made for students, by a student 🎓*