# 🔌 QuizCraft

> 🎯 *Ace your Emerging Trends in Electronics exam with AI-powered quizzes*

![Status](https://img.shields.io/badge/status-live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🕐 Development Timeline

**Session 1 (Pre-May 2026): Initial Build**
- QuizCraft built with 218 questions (MCQ Bank)
- Deployed to Vercel: https://study-platform-peach-iota.vercel.app

**Session 2 (May 2, 2026): ETE Textbook Extraction + Firebase Setup**
- Extracted 100 questions from the full ETE.pdf textbook (20 per unit, 5 units)
- Merged with 218 MCQ Bank questions = 318+ total questions
- Set up Firebase project for future auth/persistence
- Two question sets now available: "Emerging Trends in Electronics" (100 Qs) and "Emerging Trends in Electronics (MCQ Bank)" (400+ Qs)
- URL update: quiz now lives at `/quiz/ete-textbook` for textbook questions

**Session 3 (May 10, 2026): Bug Fix Sprint + Auto-Browser Testing**
- Sub-agent testing revealed multiple dead buttons on home page: "Start Quiz — All Chapters", individual chapter/unit buttons, "All Questions", and Leaderboard all non-functional
- Progress stats not updating after quiz completion; leaderboard staying empty
- Root causes: stale React closures on chapter button onClick handlers, `window.focus` event not firing on Next.js client-side router navigation, "All Questions" button missing onClick handler
- Fixes applied: `nameRef` pattern to avoid stale closures, `useEffect([pathname])` for stats reload, wired up "All Questions" button
- Build verified clean, pushed to GitHub → Vercel auto-deploy
- Browser automation confirmed all navigation and quiz flow working end-to-end

**Session 4 (May 10, 2026): Resume / Incomplete Save Feature**
- Added `saveIncompleteAttempt()` / `loadIncompleteAttempt()` / `clearIncompleteAttempt()` in lib/quizData.ts
- Home page now shows amber "Unfinished Quiz Found" banner if incomplete attempt exists (within 24hrs)
- "Resume Quiz" restores exact question position, all previous answers, resets timer
- "Discard" clears incomplete attempt for fresh start
- `beforeunload` event + useEffect cleanup saves partial progress on navigate away
- `completed: false` attempts never touch leaderboard or stats
- SkillsMP integrations: nextjs-stack-bug-fixer, ahooks, generic-react-ux-designer, zustand-state-management

---

## ✨ Features

- 🧠 **318+ Real Questions** — 100 from ETE textbook + 218+ from MCQ Bank
- ⏱️ **Timed Quizzes** — 60 seconds per question with auto-advance
- 📊 **Chapter-wise Tracking** — See your performance across 3 chapters
- 🎯 **Weak Topic Detection** — Automatically identifies topics you need to work on
- 🔄 **Smart Retests** — Re-quiz only the topics you struggled with
- 🏆 **Leaderboard** — Compete with your peers
- 🌙 **Dark Mode Only** — Easy on the eyes during late-night study sessions
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 📚 Subject Coverage

### Emerging Trends in Electronics (Textbook)

| Unit | Topic | Questions |
|------|-------|-----------|
| 1 | Advanced Processors and Technology | 20 |
| 2 | AI and Machine Learning | 20 |
| 3 | ESP32 Microcontroller | 20 |
| 4 | IoT and Embedded Systems | 20 |
| 5 | Emerging Technologies | 20 |

**Total: 100 Questions** (textbook extraction)

### Emerging Trends in Electronics (MCQ Bank)

| Chapter | Topic | Questions |
|---------|-------|-----------|
| 1 | Advanced Processors and Technology | ~72 |
| 2 | AI and Machine Learning | ~74 |
| 3 | ESP32 Microcontroller | ~72 |

**Total: 218+ Questions** (MCQ Bank)

**Combined Total: 318+ Questions**

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
│   ├── page.tsx                    # Home — subject selection & name input
│   ├── quiz/[subject]/page.tsx     # Quiz engine (setup + quiz + complete phases)
│   ├── results/[attemptId]/page.tsx # Results & weak topic analysis
│   ├── leaderboard/page.tsx        # Rankings
│   └── profile/page.tsx            # User profile
├── components/
│   └── ui/                         # Shadcn UI components
├── data/
│   └── questions.json              # All 318+ ETE questions
├── lib/
│   ├── quizData.ts                 # localStorage helpers, question data
│   ├── firebase.ts                 # Firebase config
│   ├── firebaseHelpers.ts          # Firestore helpers
│   └── eteExplanations.ts          # Answer explanations
└── public/                        # Static assets
```

---

## 🎨 Design System

**Color Palette:**
- 🍂 Background: `#1a1209` (deep warm brown)
- 🍯 Primary: `#f6aa1c` (amber gold)
- 🤍 Light: `#faf3e0` (warm cream)
- 🟤 Muted: `#8b7355` (warm brown)
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

## 📈 Future Roadmap

- [ ] Add more subjects
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