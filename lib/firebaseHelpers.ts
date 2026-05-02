import { collection, addDoc, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "./firebase";

export async function saveAttemptToFirestore(data: {
  name: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  weakTopics: string[];
  timestamp: number;
}) {
  try {
    await addDoc(collection(db, "attempts"), data);
  } catch (e) {
    console.warn("QuizCraft: Failed to save attempt to Firestore", e);
  }
}

export async function getLeaderboard(limitCount = 50): Promise<any[]> {
  try {
    const q = query(collection(db, "attempts"), orderBy("percentage", "desc"), limit(limitCount));
    // Add timeout fallback
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), 5000)
    );
    const snap = await Promise.race([getDocs(q), timeoutPromise]);
    return (snap as any).docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.warn("QuizCraft: getLeaderboard failed, falling back to localStorage", e);
    return [];
  }
}
