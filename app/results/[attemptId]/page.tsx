"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  RotateCcw,
  Home,
  AlertTriangle,
} from "lucide-react";

// Placeholder quiz data — same as quiz page
const PLACEHOLDER_QUESTIONS = [
  {
    id: "q1",
    text: "What is the SI unit of force?",
    options: { A: "Joule", B: "Newton", C: "Watt", D: "Pascal" },
    correctAnswer: "B",
    topic: "Kinematics",
    chapterName: "Mechanics",
  },
  {
    id: "q2",
    text: "Which law states that for every action, there is an equal and opposite reaction?",
    options: { A: "First Law", B: "Second Law", C: "Third Law", D: "Law of Gravitation" },
    correctAnswer: "C",
    topic: "Laws of Motion",
    chapterName: "Mechanics",
  },
  {
    id: "q3",
    text: "The acceleration due to gravity on Earth is approximately:",
    options: { A: "8.8 m/s²", B: "9.8 m/s²", C: "10.8 m/s²", D: "11.8 m/s²" },
    correctAnswer: "B",
    topic: "Gravitation",
    chapterName: "Gravitation",
  },
  {
    id: "q4",
    text: "Which of the following is a scalar quantity?",
    options: { A: "Velocity", B: "Acceleration", C: "Force", D: "Mass" },
    correctAnswer: "D",
    topic: "Kinematics",
    chapterName: "Mechanics",
  },
  {
    id: "q5",
    text: "Momentum is defined as:",
    options: { A: "Force × Time", B: "Mass × Velocity", C: "Mass × Acceleration", D: "Force × Distance" },
    correctAnswer: "B",
    topic: "Laws of Motion",
    chapterName: "Mechanics",
  },
];

interface AttemptData {
  id: string;
  date: number;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number; // seconds
  chapters: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  wrongQuestionIds: string[];
}

interface WrongQuestion {
  id: string;
  text: string;
  options: Record<string, string>;
  yourAnswer: string;
  correctAnswer: string;
  topic: string;
  chapterName: string;
}

// Colors
const C = {
  bg: "#1D1E2C",
  surface: "#252636",
  accent: "#AC9FBB",
  secondary: "#59656F",
  light: "#F7EBEC",
  muted: "#DDBDD5",
  success: "#81c784",
  error: "#e57373",
};

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Circular score SVG component
function ScoreCircle({ percentage }: { percentage: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 70 ? C.success : percentage >= 50 ? C.accent : C.error;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={C.surface}
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold"
          style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
        >
          {percentage}%
        </span>
        <span className="text-sm" style={{ color: C.muted }}>
          Score
        </span>
      </div>
    </div>
  );
}

// Chapter bar chart
function ChapterBar({
  chapter,
  correct,
  total,
}: {
  chapter: string;
  correct: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const color =
    pct >= 70 ? C.success : pct >= 50 ? C.accent : C.error;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span style={{ color: C.light }}>{chapter}</span>
        <span style={{ color: C.muted }}>
          {correct}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: C.surface }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [expandedWrong, setExpandedWrong] = useState<Record<string, boolean>>({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quizcraft_last_attempt");
    if (!stored) {
      setNotFound(true);
      return;
    }

    try {
      const data: AttemptData = JSON.parse(stored);
      setAttempt(data);

      // Reconstruct wrong questions from stored IDs + PLACEHOLDER_QUESTIONS
      const wrong: WrongQuestion[] = data.wrongQuestionIds
        .map((id) => {
          const q = PLACEHOLDER_QUESTIONS.find((pq) => pq.id === id);
          if (!q) return null;
          const answersRaw = localStorage.getItem("quizcraft_answers");
          const answers = answersRaw ? JSON.parse(answersRaw) : {};
          return {
            id: q.id,
            text: q.text,
            options: q.options,
            yourAnswer: answers[q.id] || "?",
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            chapterName: q.chapterName,
          } as WrongQuestion;
        })
        .filter(Boolean) as WrongQuestion[];

      setWrongQuestions(wrong);
    } catch {
      setNotFound(true);
    }
  }, [attemptId]);

  if (notFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: C.bg }}
      >
        <Card
          className="max-w-md w-full text-center p-8"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}
        >
          <div className="text-5xl mb-4">🔍</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
          >
            No Results Found
          </h2>
          <p className="mb-6" style={{ color: C.muted }}>
            Take a quiz first to see your results here.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            style={{
              backgroundColor: C.accent,
              color: C.bg,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⚡</div>
          <p style={{ color: C.muted }}>Loading results...</p>
        </div>
      </div>
    );
  }

  const isFasterThanAvg = attempt.timeTaken < 300; // assumed avg 5 min
  const chapterEntries = Object.entries(attempt.chapters || {});
  const avgTimePerQuestion = 60; // seconds, arbitrary for display

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            style={{ color: C.muted }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
          >
            Quiz Results
          </h1>
        </div>

        {/* Score Card */}
        <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle percentage={attempt.percentage} />
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
                  >
                    {attempt.score}/{attempt.total}
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>
                    questions correct
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: C.bg }}
                  >
                    <Clock className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>
                      {formatTime(attempt.timeTaken)}
                    </span>
                  </div>
                  {isFasterThanAvg && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ backgroundColor: `${C.success}22` }}
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: C.success }} />
                      <span style={{ color: C.success }}>Faster than average!</span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: C.bg }}
                  >
                    <Target className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>
                      {Math.round(attempt.timeTaken / attempt.total)}s/question
                    </span>
                  </div>
                </div>

                {/* Score emoji */}
                <p className="text-3xl">
                  {attempt.percentage >= 80
                    ? "🎉"
                    : attempt.percentage >= 60
                    ? "👍"
                    : "📚"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Breakdown */}
        {chapterEntries.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle
                className="text-lg"
                style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
              >
                📊 Chapter Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chapterEntries.map(([chapter, data]) => (
                <ChapterBar
                  key={chapter}
                  chapter={chapter}
                  correct={data.correct}
                  total={data.total}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Weak Topics */}
        {attempt.weakTopics.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle
                className="text-lg flex items-center gap-2"
                style={{ fontFamily: "Lexend, sans-serif", color: C.error }}
              >
                <AlertTriangle className="w-5 h-5" />
                Weak Topics ({attempt.weakTopics.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attempt.weakTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: C.bg }}
                >
                  <span style={{ color: C.light }}>{topic}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Store weak topic for retest and navigate to quiz
                      localStorage.setItem("quizcraft_retest_topic", topic);
                      const subject = localStorage.getItem("quizcraft_subject") || "ete";
                      router.push(`/quiz/${subject}`);
                    }}
                    style={{
                      borderColor: C.accent,
                      color: C.accent,
                      fontFamily: "Lexend, sans-serif",
                    }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retest
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Wrong Answers Review */}
        {wrongQuestions.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle
                className="text-lg flex items-center gap-2"
                style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
              >
                <XCircle className="w-5 h-5" style={{ color: C.error }} />
                Wrong Answers ({wrongQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((wq) => (
                <div
                  key={wq.id}
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: C.bg }}
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() =>
                      setExpandedWrong((prev) => ({
                        ...prev,
                        [wq.id]: !prev[wq.id],
                      }))
                    }
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                      <span
                        className="text-sm font-medium line-clamp-2"
                        style={{ color: C.light }}
                      >
                        {wq.text}
                      </span>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 transition-transform"
                      style={{
                        color: C.muted,
                        transform:
                          expandedWrong[wq.id] ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {expandedWrong[wq.id] && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="space-y-2">
                        {Object.entries(wq.options).map(([key, val]) => {
                          const isCorrect = key === wq.correctAnswer;
                          const isWrong = key === wq.yourAnswer && !isCorrect;
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-2 p-2 rounded text-sm"
                              style={{
                                backgroundColor: isCorrect
                                  ? `${C.success}22`
                                  : isWrong
                                  ? `${C.error}22`
                                  : "transparent",
                                color: isCorrect
                                  ? C.success
                                  : isWrong
                                  ? C.error
                                  : C.muted,
                              }}
                            >
                              <span className="font-bold">{key}.</span>
                              <span>{val}</span>
                              {isCorrect && <CheckCircle className="w-3 h-3 ml-auto" />}
                              {isWrong && <span className="ml-auto text-xs">Your answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className="flex gap-2 text-xs"
                        style={{ color: C.muted }}
                      >
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: C.secondary, color: C.muted }}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {wq.chapterName}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={() => {
              // Retest weak topics only — store filtered question IDs
              const retestIds = attempt.wrongQuestionIds.slice(0, 25);
              localStorage.setItem("quizcraft_retest_ids", JSON.stringify(retestIds));
              const subject = localStorage.getItem("quizcraft_subject") || "ete";
              router.push(`/quiz/${subject}`);
            }}
            disabled={attempt.wrongQuestionIds.length === 0}
            style={{
              backgroundColor: C.accent,
              color: C.bg,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retest Weak Topics
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("quizcraft_retest_ids");
              const subject = localStorage.getItem("quizcraft_subject") || "ete";
              router.push(`/quiz/${subject}`);
            }}
            style={{
              borderColor: C.secondary,
              color: C.light,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Full Retest
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            style={{
              borderColor: C.secondary,
              color: C.light,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}