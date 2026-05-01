import { Question, Chapter, Subject } from "@/types";

// Storage keys
const QUESTIONS_KEY = "study_platform_questions";
const USER_PROGRESS_KEY = "study_platform_progress";

// Default question bank (populated on first load if empty)
const DEFAULT_QUESTIONS: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    chapters: [
      {
        id: "physics-ch1",
        name: "Kinematics",
        subjectId: "physics",
        questions: [
          {
            id: "phy-q1",
            chapterId: "physics-ch1",
            chapterName: "Kinematics",
            subjectId: "physics",
            text: "What is the SI unit of force?",
            options: { A: "Joule", B: "Newton", C: "Watt", D: "Pascal" },
            correctAnswer: "B",
            topic: "Kinematics",
          },
          {
            id: "phy-q2",
            chapterId: "physics-ch1",
            chapterName: "Kinematics",
            subjectId: "physics",
            text: "Which of the following is a scalar quantity?",
            options: { A: "Velocity", B: "Acceleration", C: "Force", D: "Mass" },
            correctAnswer: "D",
            topic: "Kinematics",
          },
          {
            id: "phy-q3",
            chapterId: "physics-ch1",
            chapterName: "Kinematics",
            subjectId: "physics",
            text: "A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?",
            options: { A: "5 m/s", B: "10 m/s", C: "15 m/s", D: "20 m/s" },
            correctAnswer: "B",
            topic: "Kinematics",
          },
        ],
      },
      {
        id: "physics-ch2",
        name: "Laws of Motion",
        subjectId: "physics",
        questions: [
          {
            id: "phy-q4",
            chapterId: "physics-ch2",
            chapterName: "Laws of Motion",
            subjectId: "physics",
            text: "Which law states that for every action, there is an equal and opposite reaction?",
            options: { A: "First Law", B: "Second Law", C: "Third Law", D: "Law of Gravitation" },
            correctAnswer: "C",
            topic: "Laws of Motion",
          },
          {
            id: "phy-q5",
            chapterId: "physics-ch2",
            chapterName: "Laws of Motion",
            subjectId: "physics",
            text: "Momentum is defined as:",
            options: { A: "Force × Time", B: "Mass × Velocity", C: "Mass × Acceleration", D: "Force × Distance" },
            correctAnswer: "B",
            topic: "Laws of Motion",
          },
        ],
      },
      {
        id: "physics-ch3",
        name: "Gravitation",
        subjectId: "physics",
        questions: [
          {
            id: "phy-q6",
            chapterId: "physics-ch3",
            chapterName: "Gravitation",
            subjectId: "physics",
            text: "The acceleration due to gravity on Earth is approximately:",
            options: { A: "8.8 m/s²", B: "9.8 m/s²", C: "10.8 m/s²", D: "11.8 m/s²" },
            correctAnswer: "B",
            topic: "Gravitation",
          },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    chapters: [
      {
        id: "chem-ch1",
        name: "Atomic Structure",
        subjectId: "chemistry",
        questions: [
          {
            id: "chem-q1",
            chapterId: "chem-ch1",
            chapterName: "Atomic Structure",
            subjectId: "chemistry",
            text: "Who discovered the electron?",
            options: { A: "Rutherford", B: "Thomson", C: "Bohr", D: "Dalton" },
            correctAnswer: "B",
            topic: "Atomic Structure",
          },
          {
            id: "chem-q2",
            chapterId: "chem-ch1",
            chapterName: "Atomic Structure",
            subjectId: "chemistry",
            text: "The maximum number of electrons in the M shell is:",
            options: { A: "2", B: "8", C: "18", D: "32" },
            correctAnswer: "C",
            topic: "Atomic Structure",
          },
        ],
      },
      {
        id: "chem-ch2",
        name: "Chemical Bonding",
        subjectId: "chemistry",
        questions: [
          {
            id: "chem-q3",
            chapterId: "chem-ch2",
            chapterName: "Chemical Bonding",
            subjectId: "chemistry",
            text: "Which type of bond is formed between Na and Cl in NaCl?",
            options: { A: "Covalent", B: "Ionic", C: "Metallic", D: "Hydrogen" },
            correctAnswer: "B",
            topic: "Chemical Bonding",
          },
        ],
      },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    chapters: [
      {
        id: "math-ch1",
        name: "Algebra",
        subjectId: "mathematics",
        questions: [
          {
            id: "math-q1",
            chapterId: "math-ch1",
            chapterName: "Algebra",
            subjectId: "mathematics",
            text: "If x² - 5x + 6 = 0, then x equals:",
            options: { A: "1, 6", B: "2, 3", C: "3, 4", D: "5, 1" },
            correctAnswer: "B",
            topic: "Algebra",
          },
        ],
      },
      {
        id: "math-ch2",
        name: "Calculus",
        subjectId: "mathematics",
        questions: [
          {
            id: "math-q2",
            chapterId: "math-ch2",
            chapterName: "Calculus",
            subjectId: "mathematics",
            text: "The derivative of x² is:",
            options: { A: "x", B: "2x", C: "x²", D: "2x²" },
            correctAnswer: "B",
            topic: "Calculus",
          },
        ],
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    chapters: [
      {
        id: "bio-ch1",
        name: "Cell Biology",
        subjectId: "biology",
        questions: [
          {
            id: "bio-q1",
            chapterId: "bio-ch1",
            chapterName: "Cell Biology",
            subjectId: "biology",
            text: "The powerhouse of the cell is:",
            options: { A: "Nucleus", B: "Mitochondria", C: "Ribosome", D: "Golgi apparatus" },
            correctAnswer: "B",
            topic: "Cell Biology",
          },
        ],
      },
    ],
  },
];

// Load questions from localStorage or use defaults
export function loadQuestions(): Subject[] {
  if (typeof window === "undefined") return DEFAULT_QUESTIONS;

  const stored = localStorage.getItem(QUESTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_QUESTIONS;
    }
  }

  // Initialize with default questions on first load
  saveQuestions(DEFAULT_QUESTIONS);
  return DEFAULT_QUESTIONS;
}

// Save questions to localStorage
export function saveQuestions(questions: Subject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

// Get a single subject by ID
export function getSubject(subjectId: string): Subject | undefined {
  const questions = loadQuestions();
  return questions.find((s) => s.id === subjectId);
}

// Get chapters for a subject
export function getChapters(subjectId: string): Chapter[] {
  const subject = getSubject(subjectId);
  return subject?.chapters || [];
}

// Get questions for a specific chapter
export function getChapterQuestions(subjectId: string, chapterId: string): Question[] {
  const subject = getSubject(subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);
  return chapter?.questions || [];
}

// Get all questions for a subject (optionally filtered by chapter)
export function getSubjectQuestions(subjectId: string, chapterId?: string): Question[] {
  const subject = getSubject(subjectId);
  if (!subject) return [];

  if (chapterId) {
    const chapter = subject.chapters.find((c) => c.id === chapterId);
    return chapter?.questions || [];
  }

  return subject.chapters.flatMap((c) => c.questions);
}

// Get a single question by ID
export function getQuestion(questionId: string): Question | undefined {
  const questions = loadQuestions();
  for (const subject of questions) {
    for (const chapter of subject.chapters) {
      const question = chapter.questions.find((q) => q.id === questionId);
      if (question) return question;
    }
  }
  return undefined;
}

// Get all topics across all subjects
export function getAllTopics(): string[] {
  const questions = loadQuestions();
  const topicsSet = new Set<string>();
  questions.forEach((subject) => {
    subject.chapters.forEach((chapter) => {
      chapter.questions.forEach((q) => {
        if (q.topic) topicsSet.add(q.topic);
      });
    });
  });
  return Array.from(topicsSet);
}

// Get topics for a specific subject
export function getSubjectTopics(subjectId: string): string[] {
  const subject = getSubject(subjectId);
  if (!subject) return [];

  const topicsSet = new Set<string>();
  subject.chapters.forEach((chapter) => {
    chapter.questions.forEach((q) => {
      if (q.topic) topicsSet.add(q.topic);
    });
  });
  return Array.from(topicsSet);
}

export { DEFAULT_QUESTIONS };
