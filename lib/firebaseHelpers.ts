// Replace the getLeaderboard function in lib/firebaseHelpers.ts
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
    // Add timeout fallback - 3 seconds max
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), 3000)
    );
    const snap = await Promise.race([getDocs(q), timeoutPromise]);
    const docs = (snap as any).docs;
    if (docs.length === 0) return [];
    return docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.warn("QuizCraft: getLeaderboard failed, returning empty array", e);
    return [];
  }
}
