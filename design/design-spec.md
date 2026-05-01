# QuizCraft — Design Specification

> A gamified, dark-themed study quiz platform. Clean, modern, distraction-free.

---

## 1. Brand & Philosophy

- **Product Name:** QuizCraft
- **Tagline:** "Master your subjects, one quiz at a time."
- **Vibe:** Focused, rewarding, slightly retro-gaming aesthetic without being childish. Think "深夜学习 terminal meets polished modern app."
- **Primary Mode:** Dark theme only. No light mode toggle needed.

---

## 2. Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background | Near Black | `#0f0f0f` | Page background |
| Surface | Dark Navy | `#1a1a2e` | Cards, panels, modals |
| Surface Elevated | Midnight | `#16162a` | Hover states, elevated cards |
| Accent Primary | Indigo | `#6366f1` | CTAs, active states, links |
| Accent Hover | Bright Indigo | `#818cf8` | Hover on accent elements |
| Accent Secondary | Violet | `#a78bfa` | Secondary highlights, badges |
| Success | Emerald | `#10b981` | Correct answers, pass states |
| Warning | Amber | `#f59e0b` | Partial scores, weak topics |
| Error | Rose | `#ef4444` | Wrong answers, error states |
| Text Primary | Off White | `#f1f5f9` | Headings, main body text |
| Text Secondary | Slate | `#94a3b8` | Captions, labels, secondary text |
| Text Muted | Dim Slate | `#475569` | Placeholders, disabled text |
| Border | Dark Border | `#2d2d4a` | Card borders, dividers |
| Progress Track | Deep Track | `#252540` | Unfilled progress bars |

### Gradient Overlays
- **Score Glow:** `linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)` — used on score cards
- **Card Shine:** `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)` — subtle top gloss on cards

---

## 3. Typography

**Font Family:** `Inter` (Google Fonts) — fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 400 | 1.4 | Badges, labels |
| `--text-sm` | 14px | 400 | 1.5 | Secondary text, captions |
| `--text-base` | 16px | 400 | 1.6 | Body text |
| `--text-lg` | 18px | 500 | 1.5 | Card titles, emphasis |
| `--text-xl` | 20px | 600 | 1.4 | Section headings |
| `--text-2xl` | 24px | 700 | 1.3 | Page titles |
| `--text-3xl` | 32px | 800 | 1.2 | Hero numbers (score display) |
| `--text-4xl` | 48px | 800 | 1.1 | Big score (results page) |

**Letter Spacing:** Headings use `letter-spacing: -0.02em` for a tighter, more premium feel.

---

## 4. Spacing System

Base unit: `4px`

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

**Border Radius:**
- Small (badges, tags): `6px`
- Medium (cards, buttons): `12px`
- Large (modals, panels): `16px`
- Full (avatars, pills): `9999px`

---

## 5. Shadows & Elevation

```css
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-elevated: 0 8px 40px rgba(0, 0, 0, 0.6);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);  /* accent glow */
```

---

## 6. Component Inventory

### 6.1 Buttons

**Primary Button**
- Background: `#6366f1` | Hover: `#818cf8` | Active: `#4f46e5`
- Text: `#ffffff`, `--text-base`, weight 600
- Padding: `12px 24px` | Border radius: `12px`
- States:
  - Default: solid indigo bg
  - Hover: brighter indigo + `box-shadow: var(--shadow-glow)` + slight scale (1.02)
  - Active: darker indigo + scale (0.98)
  - Disabled: opacity 0.4, cursor not-allowed, no hover effects
  - Loading: spinner icon replaces text, opacity 0.8

**Secondary Button**
- Background: `transparent` | Border: `1px solid #6366f1` | Text: `#6366f1`
- Hover: bg `rgba(99,102,241,0.1)`, border brightens
- Active/Disabled/Loading: analogous to primary

**Ghost Button**
- Background: transparent | Text: `#94a3b8`
- Hover: text `#f1f5f9`, subtle bg `rgba(255,255,255,0.05)`
- Used for: navigation links, "Skip" actions

**Icon Button**
- Size: `40px × 40px` | Border radius: `10px`
- Background: `#1a1a2e` | Icon: `#94a3b8`
- Hover: bg `#252540`, icon `#f1f5f9`

---

### 6.2 Cards

**Subject Selection Card**
- Size: responsive, min `160px × 140px`
- Background: `#1a1a2e` | Border: `1px solid #2d2d4a`
- Border radius: `16px` | Padding: `24px`
- Contains: subject icon/emoji, subject name, question count badge
- Hover: border color transitions to `#6366f1`, subtle glow, scale 1.02
- Selected: border `#6366f1` solid 2px, bg slightly lighter

**Question Card**
- Full width minus margins | Padding: `32px`
- Background: `#1a1a2e` | Border radius: `16px`
- Question text: `--text-xl`, weight 600, color `#f1f5f9`
- Options listed below with `16px` gap

**Score Card (Results Hero)**
- Centered | Max width: `400px`
- Background: gradient overlay + subtle shimmer
- Score number: `--text-4xl`, weight 800, white
- Label below: `--text-sm`, `#94a3b8`

---

### 6.3 Progress Bars

**Quiz Progress Bar**
- Height: `8px` | Border radius: `full`
- Track (empty): `#252540`
- Fill (completed): `#6366f1` with smooth transition
- Animation: width transition `0.4s ease-out`

**Topic Breakdown Bar**
- Height: `12px` | Border radius: `6px`
- Track: `#252540`
- Fill colors by score:
  - `0-40%`: `#ef4444` (red)
  - `41-70%`: `#f59e0b` (amber)
  - `71-100%`: `#10b981` (emerald)
- Hover: shows tooltip with exact %

**Stat Bar (Dashboard)**
- Height: `24px` | Border radius: `6px`
- Shows per-chapter performance as segmented bar

---

### 6.4 Badges & Tags

**Score Badge**
- Border radius: `full` (pill) | Padding: `4px 12px`
- Variants by score range (same color logic as breakdown bars)
- Text: `--text-xs`, weight 600, white

**Topic Tag**
- Border radius: `6px` | Padding: `4px 10px`
- Background: `rgba(99,102,241,0.15)` | Text: `#a78bfa`
- Used on: wrong answer review, leaderboard entries

**Rank Badge**
- `#1a1a2e` background, gold/silver/bronze border for top 3
- Rank number in `--text-lg` bold

---

### 6.5 Tables

**Leaderboard Table**
- Background: `#1a1a2e` | Border radius: `12px` | Overflow hidden
- Header row: bg `#16162a`, text `#94a3b8`, `--text-sm`, weight 600, UPPERCASE
- Data rows: border-bottom `1px solid #2d2d4a`, padding `16px 20px`
- Row hover: bg `#16162a`
- Columns: Rank | Name | Score | Subject | Date
- Sticky header on scroll

---

### 6.6 Modals

**Confirmation Modal**
- Overlay: `rgba(0,0,0,0.7)` with `backdrop-filter: blur(8px)`
- Modal box: bg `#1a1a2e`, border radius `16px`, padding `32px`, max-width `420px`
- Entrance: fade + scale from 0.95 to 1, `0.2s ease-out`
- Exit: reverse, `0.15s ease-in`

**Results Detail Modal (Wrong Answers)**
- Full height on mobile, centered card on desktop
- Shows question, user's answer (red highlight), correct answer (green highlight)

---

### 6.7 Timer

- Display: monospace-style numbers using Inter with tabular nums
- Color: `#f59e0b` (warning) when <2 min, `#ef4444` (error) when <30s
- Subtle pulse animation when <30s remaining

---

### 6.8 Confetti Animation

- Triggered when score > 70%
- Canvas overlay, 80-120 particles
- Colors: `#6366f1`, `#a78bfa`, `#10b981`, `#f59e0b`
- Duration: 3 seconds
- Particles: small rectangles + circles, gravity fall + slight drift
- Fires once per results page load (not on revisit)

---

### 6.9 Navigation / Top Bar

- Height: `64px` | Background: `#0f0f0f` with bottom border `#2d2d4a`
- Left: Logo/brand name "QuizCraft" in `--text-xl`, weight 700, color `#6366f1`
- Right: Avatar circle (initials), settings icon
- Sticky, no shadow

---

### 6.10 Input Fields

**Text Input (Name Entry)**
- Height: `48px` | Border radius: `12px`
- Background: `#1a1a2e` | Border: `1px solid #2d2d4a`
- Text: `#f1f5f9`, `--text-base`
- Placeholder: `#475569`
- Focus: border `#6366f1`, box-shadow `0 0 0 3px rgba(99,102,241,0.2)`
- Error: border `#ef4444`, helper text below in `#ef4444`

---

## 7. Screen Layouts

### 7.1 Home / Landing Page

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft logo]                [⚙] [👤 JD]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─── HERO TEXT ───────────────────────────────────┐  │
│   │                                                   │  │
│   │  "Ready to test your knowledge?"                 │  │
│   │  Enter your name to begin                        │  │
│   │                                                   │  │
│   │  ┌────────────────────────┐                      │  │
│   │  │  👤  Enter your name   │  ← Input field      │  │
│   │  └────────────────────────┘                      │  │
│   │                                                   │  │
│   └───────────────────────────────────────────────────┘  │
│                                                         │
│   ┌─── SUBJECT SELECTION ───────────────────────────┐  │
│   │                                                   │  │
│   │   ┌─────────────┐    ┌─────────────┐             │  │
│   │   │  📄         │    │  📄         │             │  │
│   │   │  firstPDF   │    │ secondPDF   │             │  │
│   │   │  30 Qs      │    │  25 Qs      │             │  │
│   │   └─────────────┘    └─────────────┘             │  │
│   │                                                   │  │
│   │            [ 🚀 Start Quiz ]                      │  │
│   │                                                   │  │
│   └───────────────────────────────────────────────────┘  │
│                                                         │
│   ┌─── MINI LEADERBOARD ────────────────────────────┐  │
│   │  🏆 Top Performers Today                        │  │
│   │  1. Priya S.      95%   firstPDF                │  │
│   │  2. Rahul M.      88%   secondPDF               │  │
│   │  3. Anya K.       82%   firstPDF                │  │
│   │             [View All →]                         │  │
│   └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Page padding: `24px` horizontal on mobile, `48px` on desktop
- Section gap: `48px`
- Card grid gap: `20px`
- Hero text size: `--text-2xl` centered

**Behavior:**
- Name input required before subject selection enables
- Subject cards: single select, click to toggle selection
- Start Quiz button: disabled (opacity 0.4) until name entered AND subject selected
- Mini leaderboard: shows top 3, truncated

---

### 7.2 Quiz Taking Page

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft]              Progress: 5/20  ⏱ 04:32│
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─── PROGRESS BAR ────────────────────────┐   │
│          ├▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░┤   │
│          └─────────────────────────────────────────┘   │
│                                                         │
│          ┌─── QUESTION CARD ────────────────────────┐   │
│          │                                               │   │
│          │  Q5. What is the time complexity of      │   │
│          │  binary search?                            │   │
│          │                                               │   │
│          │  ┌─────────────────────────────────┐      │   │
│          │  │ A.  O(n)                        │      │   │
│          │  └─────────────────────────────────┘      │   │
│          │  ┌─────────────────────────────────┐      │   │
│          │  │ B.  O(log n)                    │ ←selected│  │
│          │  └─────────────────────────────────┘      │   │
│          │  ┌─────────────────────────────────┐      │   │
│          │  │ C.  O(n²)                       │      │   │
│          │  └─────────────────────────────────┘      │   │
│          │  ┌─────────────────────────────────┐      │   │
│          │  │ D.  O(1)                        │      │   │
│          │  └─────────────────────────────────┘      │   │
│          │                                               │   │
│          └─────────────────────────────────────────────┘   │
│                                                         │
│                    [ Submit Answer ]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Question card max-width: `720px`, centered
- Card padding: `32px`
- Option gap: `12px`
- Progress bar full width, below top bar

**Behavior:**
- Timer counts up or down (configurable per quiz)
- Clicking option highlights it with indigo border
- Submit button: disabled until option selected
- After submit: brief green/red flash on the selected option, auto-advance after 1.2s
- No back navigation (quiz is forward-only)
- Keyboard: 1/2/3/4 keys select options A/B/C/D, Enter submits

---

### 7.3 Results Page

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft]                      [🔄 Retake]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─── SCORE HERO ───────────────────────────┐  │
│          │                                               │  │
│          │              85%                            │  │
│          │         Your Score                          │  │
│          │                                               │  │
│          │      🏆 17/20 Correct                       │  │
│          │      ⏱ 6m 42s                              │  │
│          │                                               │  │
│          └─────────────────────────────────────────────┘  │
│                                                         │
│          ┌─── TOPIC BREAKDOWN ───────────────────────┐  │
│          │                                               │  │
│          │  Arrays & Sorting     ████████████░░  80% │  │
│          │  Linked Lists        ██████░░░░░░░░  60% │  │
│          │  Trees               ██████████████░  90% │  │
│          │  Graphs              ████████░░░░░░  70% │  │
│          │                                               │  │
│          └─────────────────────────────────────────────┘  │
│                                                         │
│          ┌─── WRONG ANSWERS ─────────────────────────┐  │
│          │  ⚠ Q3: Binary Tree traversal               │  │
│          │     Your answer: Inorder    ✗              │  │
│          │     Correct: Preorder       ✓              │  │
│          │  ──────────────────────────────────────   │  │
│          │  ⚠ Q9: Graph algorithms                   │  │
│          │     Your answer: Dijkstra   ✗              │  │
│          │     Correct: BFS            ✓              │  │
│          └─────────────────────────────────────────────┘  │
│                                                         │
│          [ 🔁 Retest Weak Topics ]  [ 📚 Full Retest ]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Score hero: centered, gradient card, `48px` padding
- Topic breakdown bars: `16px` gap between rows
- Wrong answers: accordion-style list, `16px` gap between items
- Button row: `24px` gap, centered

**Behavior:**
- Confetti fires if score > 70%
- Clicking a wrong answer expands to show full question context
- "Retest Weak Topics": only questions from topics with <60% score
- "Full Retest": all 20 questions
- Score is saved to leaderboard on reaching this page

---

### 7.4 Retest Page

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft]     Weak Topics Retest   3/8  ⏱ 02:14│
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─── PROGRESS BAR ────────────────────────┐   │
│          ├▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┤   │
│          └─────────────────────────────────────────┘   │
│                                                         │
│          ┌─── SCORE TRACKER ────────────────────────┐  │
│          │  Current: 2/3 correct  │  Best: 85%       │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
│          ┌─── QUESTION CARD ────────────────────────┐   │
│          │  (same style as Quiz Taking Page)         │   │
│          └─────────────────────────────────────────────┘   │
│                                                         │
│                    [ Submit Answer ]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behavior:**
- Header indicates this is a retest focused on weak areas
- Score tracker shows running correct count in this retest session
- "Best" reference score from original quiz shown for context
- Same submit/advance behavior as main quiz

---

### 7.5 Leaderboard Page

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft]                      [👤 JD]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─── TAB TOGGLE ────────────────────────────┐  │
│          │  [ This Week ]    [ All Time ]            │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
│          ┌─── LEADERBOARD TABLE ─────────────────────┐  │
│          │  RANK  NAME         SCORE   SUBJECT  DATE │  │
│          ├─────────────────────────────────────────│  │
│          │  🥇 1   Priya S.     95%    firstPDF  Today│  │
│          │  🥈 2   Rahul M.     88%    secondPDF Today│  │
│          │  🥉 3   Anya K.      82%    firstPDF  Today│  │
│          │      4   You (JD)    85%    firstPDF  Today│  │
│          │      5   Sam T.      78%    secondPDF Today│  │
│          │  ...                                          │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Table: full width with `20px` horizontal padding
- Row height: `64px` (comfortable touch targets)
- Tab toggle: centered, pill-style

**Behavior:**
- Active tab: indigo background, white text
- Inactive tab: transparent, slate text → hover to muted bg
- User's own row highlighted with subtle indigo left border + light bg tint
- Pagination: infinite scroll or "Load More" button (20 per page)
- Rank 1-3 get medal emoji in rank column

---

### 7.6 Progress Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR: [QuizCraft]                      [👤 JD]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          ┌─── CHAPTER BARS ─────────────────────────┐  │
│          │  Per-chapter performance bar chart        │  │
│          │                                               │  │
│          │  Ch1: ████████████░░░░░░░░  60%          │  │
│          │  Ch2: ████████████████░░░  85%          │  │
│          │  Ch3: ████████░░░░░░░░░░░  40%          │  │
│          │  Ch4: ██████████░░░░░░░░  55%          │  │
│          │  Ch5: ██████████████░░░░  78%          │  │
│          │                                               │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
│          ┌─── WEAKNESS HEATMAP ─────────────────────┐  │
│          │  Topic heatmap grid (red/yellow/green)   │  │
│          │                                               │  │
│          │  Arrays █  Linked █  Trees █  Graphs █   │  │
│          │  (🟥)    (🟨)     (🟩)    (🟨)           │  │
│          │                                               │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
│          ┌─── IMPROVEMENT TREND ────────────────────┐  │
│          │  Line chart showing score trend over time │  │
│          │  📈 Score over last 10 quizzes            │  │
│          │                                               │  │
│          └───────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Spacing:**
- Section gap: `48px`
- Bar chart rows: `24px` height bars with `12px` between rows
- Heatmap: CSS grid, `60px × 60px` cells per topic

**Behavior:**
- Chapter bars animate in on page load (staggered 100ms each)
- Heatmap cell hover: tooltip with exact score and last quiz date
- Improvement trend: smooth line chart, dots on data points, hover for details
- Data updates after each completed quiz

---

## 8. User Flow

```
[HOME] ──name + subject──▶ [QUIZ] ──answer all──▶ [RESULTS]
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                     [RETEST WEAK]                    [FULL RETEST]
                              │                               │
                              └───────────────┬───────────────┘
                                              ▼
                                           [RESULTS]
```

```
[HOME] ──leaderboard link──▶ [LEADERBOARD]
[HOME] ──dashboard link──▶  [PROGRESS DASHBOARD]
[RESULTS] ──nav──▶          [HOME]
```

**Navigation:** Tab-based within the app. No hamburger menus. Bottom nav bar on mobile with 3 items: Home, Leaderboard, Progress. Top bar on desktop.

---

## 9. Animation Specifications

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page transition (screen change) | Fade out + slide + fade in | 250ms total | ease-out |
| Card hover | scale(1.02) + border-color shift | 150ms | ease-out |
| Button hover | background shift + glow | 150ms | ease |
| Button press | scale(0.98) | 80ms | ease-in |
| Progress bar fill | width transition | 400ms | ease-out |
| Confetti | particle physics | 3000ms | gravity + drift |
| Modal open | scale(0.95→1) + fade | 200ms | ease-out |
| Tab switch | underline slide | 200ms | ease-in-out |
| Score counter | count-up animation | 1200ms | ease-out |
| Heatmap cell hover | subtle scale(1.1) + border | 100ms | ease |

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | `< 640px` | Single column, stacked cards |
| Tablet | `640px – 1024px` | 2-column grids where applicable |
| Desktop | `> 1024px` | Max content width 1200px, centered |

**Mobile-specific:**
- Bottom navigation bar (Home / Leaderboard / Progress)
- Full-width cards
- Touch-optimized option buttons (min `48px` tap height)
- Timer in top bar (no separate timer card)

---

## 11. Accessibility Notes

- All interactive elements have `focus-visible` outlines (`2px solid #6366f1`)
- Color is never the only indicator — use icons + text + color for status
- `aria-label` on icon-only buttons
- Modal traps focus
- Progress percentages announced to screen readers on completion

---

## 12. Technical Stack (Frontend)

- **Framework:** React 19 + Vite
- **Styling:** CSS Modules or Tailwind CSS v4
- **Animations:** Framer Motion
- **Charts:** Recharts or Chart.js
- **Confetti:** canvas-confetti
- **Icons:** Lucide React
- **Fonts:** Google Fonts Inter (preconnect)

---

*Last updated: 2026-05-01*
*Author: Shawn (Design subagent)*
