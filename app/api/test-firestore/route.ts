import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, limit, query } from "firebase/firestore";

export async function GET() {
  try {
    // Test write
    const docRef = await addDoc(collection(db, "attempts"), {
      name: "Test from API",
      subjectId: "test",
      score: 5,
      totalQuestions: 10,
      percentage: 50,
      weakTopics: [],
      timestamp: Date.now(),
    });

    // Test read
    const q = query(collection(db, "attempts"), orderBy("timestamp", "desc"), limit(5));
    const snap = await getDocs(q);
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({
      success: true,
      writeId: docRef.id,
      attempts,
      env: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
