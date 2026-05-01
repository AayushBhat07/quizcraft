export interface Question {
  id: string;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  text: string;
  options?: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  wrongQuestionIds: string[];
  weakTopics: string[];
  timestamp: number;
  completed: boolean;
}

export interface UserProgress {
  name: string;
  attempts: QuizAttempt[];
  bestScores: Record<string, number>; // subjectId -> best percentage
  weakTopics: Record<string, number>; // topicId -> times wrong
}
