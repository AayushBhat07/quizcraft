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

export async function getLeaderboard(limitCount = 50) {
  const q = query(collection(db, "attempts"), orderBy("percentage", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
}
