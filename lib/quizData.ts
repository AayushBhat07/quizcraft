import questionsData from "@/data/questions.json";
import type { Question, Chapter, Subject, QuizAttempt } from "@/types";

// ─── localStorage keys ───────────────────────────────
const ATTEMPTS_KEY = "quizcraft_attempts";
const USER_KEY = "quizcraft_user";
const PREFS_KEY = "quizcraft_quiz_prefs";
const INCOMPLETE_KEY = "quizcraft_incomplete_attempt";

// ─── Types for the raw JSON structure ───────────────
// These match the exact shape of questions.json (no chapterId/chapterName/subjectId on questions)
interface RawQuestion {
  id: string;
  text: string;
  options?: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

interface RawChapter {
  id: string;
  name: string;
  questions: RawQuestion[];
}

interface RawSubject {
  id: string;
  name: string;
  chapters: RawChapter[];
}

type QuestionsData = Record<string, RawSubject>;

// ─── Re-export types for consumers ─────────────────
export type { Question, Chapter, Subject, QuizAttempt };

// ─── Fisher-Yates shuffle ───────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Raw data access ────────────────────────────────
function getRawData(): QuestionsData {
  const raw = questionsData as any;
  // Legacy single-subject format: { subject: { id, name, chapters } }
  if (raw.subject) return { ete: raw.subject } as QuestionsData;
  // New multi-subject format: { subjects: [{ id, name, chapters }] }
  if (Array.isArray(raw.subjects)) {
    const map: QuestionsData = {};
    raw.subjects.forEach((s: RawSubject) => { map[s.id] = s; });
    return map;
  }
  return raw as QuestionsData;
}

export function getSubjects(): Subject[] {
  const data = getRawData();
  return Object.values(data).map((s) => ({
    id: s.id,
    name: s.name,
    chapters: s.chapters.map((c) => ({
      id: c.id,
      name: c.name,
      subjectId: s.id,
      questions: c.questions as Question[],
    })),
  }));
}

export function getSubject(subjectId: string): Subject | undefined {
  const data = getRawData();
  const raw = data[subjectId];
  if (!raw) return undefined;
  return {
    id: raw.id,
    name: raw.name,
    chapters: raw.chapters.map((c) => ({
      id: c.id,
      name: c.name,
      subjectId: raw.id,
      questions: c.questions as Question[],
    })),
  };
}

export function getChapters(subjectId: string): Chapter[] {
  return getSubject(subjectId)?.chapters ?? [];
}

export function getTotalQuestionCount(subjectId: string): number {
  const subject = getSubject(subjectId);
  if (!subject) return 0;
  return subject.chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
}

// ─── Quiz preference helpers ────────────────────────
export interface QuizPrefs {
  questionCount: number; // 10 | 25 | 50 | -1 (all = totalQuestions)
  selectedChapters: string[]; // chapter IDs
}

export function saveQuizPrefs(prefs: QuizPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadQuizPrefs(subjectId: string): QuizPrefs {
  if (typeof window === "undefined") {
    return { questionCount: 25, selectedChapters: [] };
  }
  const allChapters = getChapters(subjectId).map((c) => c.id);
  const defaultPrefs: QuizPrefs = {
    questionCount: 25,
    selectedChapters: allChapters,
  };
  const stored = localStorage.getItem(PREFS_KEY);
  if (!stored) {
    saveQuizPrefs({ ...defaultPrefs, selectedChapters: allChapters });
    return defaultPrefs;
  }
  try {
    const parsed = JSON.parse(stored) as QuizPrefs;
    return {
      questionCount: parsed.questionCount ?? 25,
      selectedChapters:
        parsed.selectedChapters?.length
          ? parsed.selectedChapters
          : allChapters,
    };
  } catch {
    return defaultPrefs;
  }
}

// ─── Quiz question pool ──────────────────────────────
export interface QuizQuestion extends Question {
  chapterName: string;
}

export function buildQuizPool(
  subjectId: string,
  prefs: QuizPrefs
): QuizQuestion[] {
  const subject = getSubject(subjectId);
  if (!subject) return [];

  const filtered = subject.chapters
    .filter((ch) => prefs.selectedChapters.includes(ch.id))
    .flatMap((ch) =>
      ch.questions.map((q) => ({
        ...q,
        subjectId,
        chapterName: ch.name,
      }))
    );

  return shuffleArray(filtered);
}

// ─── Attempt storage ────────────────────────────────
export interface StoredAttempt extends QuizAttempt {
  userName: string;
  answers: Record<string, string>; // questionId → selected option
  questionCount: number;
  timeTaken?: number; // seconds
  percentage?: number; // 0-100
}

export function saveAttempt(attempt: StoredAttempt): void {
  if (typeof window === "undefined") return;
  const attempts = getAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ATTEMPTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getAttemptById(id: string): StoredAttempt | undefined {
  return getAttempts().find((a) => a.id === id);
}

// ─── Incomplete attempt (mid-quiz save) ────────────
export interface IncompleteAttempt {
  subjectId: string;
  quizQuestions: QuizQuestion[];
  answers: Record<string, string>;
  currentIdx: number;
  selectedAnswer: string | null;
  timestamp: number;
  userName: string;
}

export function saveIncompleteAttempt(partial: IncompleteAttempt): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INCOMPLETE_KEY, JSON.stringify(partial));
}

export function loadIncompleteAttempt(): IncompleteAttempt | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(INCOMPLETE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as IncompleteAttempt;
    // Only valid within 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(INCOMPLETE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearIncompleteAttempt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INCOMPLETE_KEY);
}

// ─── User stats ────────────────────────────────────
export interface UserStats {
  name: string;
  bestScore: number; // percentage 0-100
  totalQuizzes: number;
  streak: number;
  weakTopics: string[];
  lastQuizDate: string | null;
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(stats));
}

export function getUserStats(): UserStats {
  if (typeof window === "undefined") {
    return { name: "", bestScore: 0, totalQuizzes: 0, streak: 0, weakTopics: [], lastQuizDate: null };
  }
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserStats;
      return { ...parsed, weakTopics: parsed.weakTopics ?? [] };
    }
  } catch {
    // fall through
  }
  const name = localStorage.getItem("quizcraft_name") ?? "";
  return { name, bestScore: 0, totalQuizzes: 0, streak: 0, weakTopics: [], lastQuizDate: null };
}

export function updateUserStatsAfterQuiz(
  score: number,
  total: number,
  wrongTopics: string[]
): UserStats {
  const current = getUserStats();
  const percentage = Math.round((score / total) * 100);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  let streak = current.streak;
  if (current.lastQuizDate === yesterday) {
    streak += 1;
  } else if (current.lastQuizDate !== today) {
    streak = 1;
  }

  // Accumulate weak topic counts
  const weakMap: Record<string, number> = {};
  current.weakTopics.forEach((t) => {
    weakMap[t] = 1;
  });
  wrongTopics.forEach((topic) => {
    weakMap[topic] = (weakMap[topic] ?? 0) + 1;
  });

  const topWeak = Object.entries(weakMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([t]) => t);

  const updated: UserStats = {
    ...current,
    totalQuizzes: current.totalQuizzes + 1,
    bestScore: Math.max(current.bestScore, percentage),
    streak,
    weakTopics: topWeak,
    lastQuizDate: today,
  };

  saveUserStats(updated);
  return updated;
}

// ─── Compute quiz results ──────────────────────────
export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  wrongQuestionIds: string[];
  weakTopics: string[];
  attemptId: string;
}

export function computeQuizResult(
  questions: QuizQuestion[],
  answers: Record<string, string>
): QuizResult {
  const wrongQuestionIds: string[] = [];
  const weakTopicsSet = new Set<string>();

  questions.forEach((q) => {
    if (answers[q.id] !== q.correctAnswer) {
      wrongQuestionIds.push(q.id);
      weakTopicsSet.add(q.topic);
    }
  });

  const score = questions.length - wrongQuestionIds.length;
  const percentage = Math.round((score / questions.length) * 100);
  const attemptId = `attempt-${Date.now()}`;

  return {
    score,
    total: questions.length,
    percentage,
    wrongQuestionIds,
    weakTopics: Array.from(weakTopicsSet),
    attemptId,
  };
}
