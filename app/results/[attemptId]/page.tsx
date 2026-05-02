"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  Flame,
  Star,
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
  timeTaken: number;
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

const C = {
  bg: "#1D1E2C",
  surface: "#252636",
  accent: "#AC9FBB",
  secondary: "#59656F",
  light: "#F7EBEC",
  muted: "#DDBDD5",
  success: "#81c784",
  error: "#e57373",
  amber: "#FFB74D",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Circular Score Ring ──────────────────────────────────────────────────────
function ScoreCircle({ percentage, size = 180 }: { percentage: number; size?: number }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage >= 70 ? C.success : percentage >= 50 ? C.amber : C.error;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.surface} strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
          {percentage}%
        </span>
        <span className="text-sm" style={{ color: C.muted }}>Score</span>
      </div>
    </div>
  );
}

// ─── Chapter Score Ring (small) ───────────────────────────────────────────────
function ChapterRing({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const size = 52;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? C.success : pct >= 50 ? C.amber : C.error;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.surface} strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── Heatmap Cell ─────────────────────────────────────────────────────────────
function HeatmapCell({ topic, score }: { topic: string; score: number }) {
  const color = score >= 70 ? C.success : score >= 50 ? C.amber : C.error;
  const pct = score;
  return (
    <div
      className="flex flex-col items-center justify-center p-2 rounded-lg cursor-default transition-all hover:scale-105"
      style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44`, minWidth: 72 }}
      title={`${topic}: ${pct}%`}
    >
      <span className="text-xs font-medium truncate max-w-full" style={{ color: C.light, fontFamily: "Lexend, sans-serif" }}>
        {topic}
      </span>
      <span className="text-xs font-bold" style={{ color }}>
        {pct}%
      </span>
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: C.bg }}>
        <Card className="max-w-md w-full text-center p-8" style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
            No Results Found
          </h2>
          <p className="mb-6" style={{ color: C.muted }}>Take a quiz first to see your results here.</p>
          <Button onClick={() => router.push("/")} className="w-full" style={{ backgroundColor: C.accent, color: C.bg, fontFamily: "Lexend, sans-serif" }}>
            <Home className="w-4 h-4 mr-2" />Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⚡</div>
          <p style={{ color: C.muted }}>Loading results...</p>
        </div>
      </div>
    );
  }

  const isFasterThanAvg = attempt.timeTaken < 300;

  // ── Chapter analysis ─────────────────────────────────────────────────────
  const chapterEntries = Object.entries(attempt.chapters || {});
  const chapterData = chapterEntries
    .map(([name, data]) => ({
      name,
      correct: data.correct,
      total: data.total,
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct); // worst first

  // Build chapter summary line
  const worst = chapterData[0];
  const best = chapterData[chapterData.length - 1];
  const chapterSummary =
    chapterData.length > 0
      ? best.pct >= 70
        ? `🏆 You aced ${best.name} — keep pushing on ${worst.name}!`
        : `📚 Focus on ${worst.name} — that's where the gaps are.`
      : "";

  // ── Weak topics heatmap (from wrong questions grouped by chapter) ────────
  type TopicScore = { topic: string; correct: number; total: number };
  const topicMap: Record<string, TopicScore> = {};
  PLACEHOLDER_QUESTIONS.forEach((q) => {
    const chapter = q.chapterName;
    const topic = q.topic;
    if (!topicMap[chapter]) topicMap[chapter] = {} as any;
    // We'll track per-topic via a flat map
  });

  // Build heatmap data: group topics by chapter, find % correct per topic
  const topicByChapter: Record<string, { topic: string; correct: number; total: number }[]> = {};
  PLACEHOLDER_QUESTIONS.forEach((q) => {
    const chapter = q.chapterName;
    if (!topicByChapter[chapter]) topicByChapter[chapter] = [];
    const existing = topicByChapter[chapter].find((t) => t.topic === q.topic);
    if (existing) {
      existing.total += 1;
      if (q.correctAnswer === attempt.wrongQuestionIds.includes(q.id)) {
        // if this question was answered wrong
      }
      // Simpler: track from wrongQuestions which topics are weak
    } else {
      topicByChapter[chapter].push({ topic: q.topic, correct: 0, total: 1 });
    }
  });

  // Mark weak topics based on weakTopics array
  const weakTopicSet = new Set(attempt.weakTopics);
  // Build final heatmap: each topic shows how many wrong out of total
  // We'll just mark topics that appear in weakTopics as weak (red),
  // otherwise green if not in wrong list (for demo data)
  const allTopicsSet = new Set(PLACEHOLDER_QUESTIONS.map((q) => q.topic));
  const allTopicsList = Array.from(allTopicsSet).map((topic) => {
    const wasWrong = weakTopicSet.has(topic);
    return { topic, score: wasWrong ? 30 : 85 }; // placeholder scores
  });

  // Group heatmap topics by chapter from PLACEHOLDER_QUESTIONS
  const heatmapChapters: Record<string, { topic: string; score: number }[]> = {};
  PLACEHOLDER_QUESTIONS.forEach((q) => {
    if (!heatmapChapters[q.chapterName]) heatmapChapters[q.chapterName] = [];
    const already = heatmapChapters[q.chapterName].find((t) => t.topic === q.topic);
    if (!already) {
      const wasWrong = weakTopicSet.has(q.topic);
      heatmapChapters[q.chapterName].push({ topic: q.topic, score: wasWrong ? 30 : 85 });
    }
  });

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} style={{ color: C.muted }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
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
                  <p className="text-3xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                    {attempt.score}/{attempt.total}
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>questions correct</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.bg }}>
                    <Clock className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>{formatTime(attempt.timeTaken)}</span>
                  </div>
                  {isFasterThanAvg && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: `${C.success}22` }}>
                      <TrendingUp className="w-4 h-4" style={{ color: C.success }} />
                      <span style={{ color: C.success }}>Faster than average!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.bg }}>
                    <Target className="w-4 h-4" style={{ color: C.accent }} />
                    <span style={{ color: C.light }}>{Math.round(attempt.timeTaken / attempt.total)}s/question</span>
                  </div>
                </div>
                <p className="text-3xl">
                  {attempt.percentage >= 80 ? "🎉" : attempt.percentage >= 60 ? "👍" : "📚"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── B. Chapter Performance ──────────────────────────────────────────── */}
        {chapterData.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                📊 Chapter Performance
              </CardTitle>
              {chapterSummary && (
                <p className="text-sm mt-1" style={{ color: C.muted }}>
                  {chapterSummary}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {/* Desktop: ring + row per chapter */}
              <div className="hidden sm:block space-y-3">
                {chapterData.map((ch) => {
                  const color = ch.pct >= 70 ? C.success : ch.pct >= 50 ? C.amber : C.error;
                  return (
                    <div
                      key={ch.name}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: C.bg, border: `1px solid ${color}33` }}
                    >
                      <ChapterRing correct={ch.correct} total={ch.total} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-medium truncate pr-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                            {ch.name}
                          </span>
                          <span className="text-sm flex-shrink-0" style={{ color: C.muted }}>
                            {ch.correct}/{ch.total} correct
                          </span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: C.surface }}>
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${ch.pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                      {ch.pct >= 70 ? (
                        <Star className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                      ) : ch.pct < 50 ? (
                        <Flame className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: compact horizontal scroll rings */}
              <div className="sm:hidden flex gap-3 overflow-x-auto pb-2">
                {chapterData.map((ch) => (
                  <div key={ch.name} className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
                    <ChapterRing correct={ch.correct} total={ch.total} size={64} />
                    <span className="text-xs mt-1 text-center truncate w-full" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                      {ch.name}
                    </span>
                    <span className="text-xs" style={{ color: C.muted }}>
                      {ch.correct}/{ch.total}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 pt-4 border-t justify-center" style={{ borderColor: `${C.secondary}44` }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.success }} />
                  <span className="text-xs" style={{ color: C.muted }}>≥70% Great</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.amber }} />
                  <span className="text-xs" style={{ color: C.muted }}>50-69% OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: C.error }} />
                  <span className="text-xs" style={{ color: C.muted }}>&lt;50% Focus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── C. Weak Topics Heatmap ───────────────────────────────────────────── */}
        {Object.keys(heatmapChapters).length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                🔥 Topic Heatmap
              </CardTitle>
              <p className="text-sm mt-0.5" style={{ color: C.muted }}>
                Color shows how well you know each topic
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(heatmapChapters).map(([chapter, topics]) => {
                const avgPct = Math.round(topics.reduce((s, t) => s + t.score, 0) / topics.length);
                const chColor = avgPct >= 70 ? C.success : avgPct >= 50 ? C.amber : C.error;
                return (
                  <div key={chapter}>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4" style={{ color: chColor }} />
                      <span className="text-sm font-medium" style={{ fontFamily: "Lexend, sans-serif", color: chColor }}>
                        {chapter}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: C.muted }}>
                        {avgPct}% avg
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <HeatmapCell key={t.topic} topic={t.topic} score={t.score} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── A. Wrong Answers Review ─────────────────────────────────────────── */}
        {wrongQuestions.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.light }}>
                <XCircle className="w-5 h-5" style={{ color: C.error }} />
                Wrong Answers ({wrongQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((wq) => (
                <div
                  key={wq.id}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.secondary}` }}
                >
                  {/* Question header */}
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() =>
                      setExpandedWrong((prev) => ({ ...prev, [wq.id]: !prev[wq.id] }))
                    }
                  >
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.error }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed" style={{ color: C.light }}>
                        {wq.text}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: `${C.accent}66`, color: C.accent }}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {wq.chapterName}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: `${C.muted}44`, color: C.muted }}
                        >
                          {wq.topic}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 mt-1 transition-transform"
                      style={{ color: C.muted, transform: expandedWrong[wq.id] ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Expanded detail */}
                  {expandedWrong[wq.id] && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${C.secondary}44` }}>
                      {/* Correct vs Your Answer comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {/* Your wrong answer */}
                        <div
                          className="p-3 rounded-lg border-l-4"
                          style={{ backgroundColor: `${C.error}11`, borderLeftColor: C.error }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: C.error }}>
                            ✗ Your Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.error }}>
                            {wq.yourAnswer}. {wq.options[wq.yourAnswer]}
                          </div>
                        </div>
                        {/* Correct answer */}
                        <div
                          className="p-3 rounded-lg border-l-4"
                          style={{ backgroundColor: `${C.success}11`, borderLeftColor: C.success }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: C.success }}>
                            ✓ Correct Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.success }}>
                            {wq.correctAnswer}. {wq.options[wq.correctAnswer]}
                          </div>
                        </div>
                      </div>

                      {/* All options with indicator */}
                      <div className="space-y-2">
                        <div className="text-xs" style={{ color: C.muted }}>All Options</div>
                        {Object.entries(wq.options).map(([key, val]) => {
                          const isCorrect = key === wq.correctAnswer;
                          const isWrongSelected = key === wq.yourAnswer && !isCorrect;
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all"
                              style={{
                                backgroundColor: isCorrect
                                  ? `${C.success}18`
                                  : isWrongSelected
                                  ? `${C.error}18`
                                  : `${C.surface}44`,
                                borderLeftColor: isCorrect
                                  ? C.success
                                  : isWrongSelected
                                  ? C.error
                                  : "transparent",
                              }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: isCorrect
                                    ? `${C.success}33`
                                    : isWrongSelected
                                    ? `${C.error}33`
                                    : `${C.secondary}44`,
                                  color: isCorrect ? C.success : isWrongSelected ? C.error : C.muted,
                                  fontFamily: "Lexend, sans-serif",
                                }}
                              >
                                {key}
                              </span>
                              <span className="text-sm flex-1" style={{ color: C.light }}>
                                {val}
                              </span>
                              {isCorrect && (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                              )}
                              {isWrongSelected && (
                                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Retest button */}
                      <Button
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("quizcraft_retest_topic", wq.topic);
                          const subject = localStorage.getItem("quizcraft_subject") || "ete";
                          router.push(`/quiz/${subject}`);
                        }}
                        className="w-full sm:w-auto"
                        style={{
                          backgroundColor: `${C.accent}22`,
                          color: C.accent,
                          border: `1px solid ${C.accent}66`,
                          fontFamily: "Lexend, sans-serif",
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Practice {wq.topic}
                      </Button>
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
            Retest Wrong Ones
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
