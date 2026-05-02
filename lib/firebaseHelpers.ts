import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";
import type { StoredAttempt } from "./quizData";
import { getUserStats } from "./quizData";

// ─── Firestore paths ──────────────────────────────────────────────────────────
// Attempts: /attempts/{odId}  (odId = attempt id)
const ATTEMPTS_COLLECTION = "attempts";

// Leaderboard: /leaderboard/{odId}
const LEADERBOARD_COLLECTION = "leaderboard";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FirestoreAttempt {
  odId: string;
  userName: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  weakTopics: string[];
  timestamp: number;
  completed: boolean;
  questionCount: number;
}

export interface LeaderboardEntry {
  odId: string;
  userName: string;
  topScore: number;
  totalQuizzes: number;
  lastAttempt: number;
}

// ─── Get current user ID (uid) ───────────────────────────────────────────────
export function getCurrentUserId(): string | null {
  const user = auth?.currentUser;
  return user ? user.uid : null;
}

// ─── Save attempt to Firestore ─────────────────────────────────────────────────
// Saves attempt and also updates leaderboard entry for this user
export async function saveAttemptToFirestore(attempt: StoredAttempt): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  const fsAttempt: FirestoreAttempt = {
    odId: attempt.id,
    userName: attempt.userName,
    subjectId: attempt.subjectId,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage,
    weakTopics: attempt.weakTopics,
    timestamp: attempt.timestamp,
    completed: attempt.completed,
    questionCount: attempt.questionCount,
  };

  // Save individual attempt
  await setDoc(doc(db, ATTEMPTS_COLLECTION, attempt.id), {
    ...fsAttempt,
    createdAt: serverTimestamp(),
  });

  // Update leaderboard: upsert this user's entry
  const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, userId);
  const existing = await getDoc(leaderboardRef);

  if (existing.exists()) {
    const data = existing.data() as LeaderboardEntry;
    await setDoc(leaderboardRef, {
      userName: attempt.userName,
      topScore: Math.max(data.topScore, percentage),
      totalQuizzes: data.totalQuizzes + 1,
      lastAttempt: attempt.timestamp,
    }, { merge: true });
  } else {
    await setDoc(leaderboardRef, {
      odId: userId,
      userName: attempt.userName,
      topScore: percentage,
      totalQuizzes: 1,
      lastAttempt: attempt.timestamp,
    });
  }
}

// ─── Load Firestore stats for current user ───────────────────────────────────
export async function getFirestoreStats(): Promise<{
  totalQuizzes: number;
  bestScore: number;
  avgScore: number;
} | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, userId);
  const snap = await getDoc(leaderboardRef);
  if (!snap.exists()) return null;

  const data = snap.data() as LeaderboardEntry;
  // Fetch all attempts to compute avg
  const q = query(
    collection(db, ATTEMPTS_COLLECTION),
    orderBy("timestamp", "desc")
  );
  const attemptsSnap = await getDocs(q);

  let totalScore = 0;
  let count = 0;
  attemptsSnap.docs.forEach((d) => {
    const a = d.data() as FirestoreAttempt;
    if (a.userName === localStorage.getItem("quizcraft_name")) {
      totalScore += a.percentage;
      count++;
    }
  });

  return {
    totalQuizzes: data.totalQuizzes,
    bestScore: data.topScore,
    avgScore: count > 0 ? Math.round(totalScore / count) : 0,
  };
}

// ─── Load global leaderboard from Firestore ───────────────────────────────────
export async function getLeaderboard(limitCount = 20): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, LEADERBOARD_COLLECTION),
    orderBy("topScore", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}
