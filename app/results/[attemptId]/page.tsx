"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Flame,
  Star,
  Lightbulb,
} from "lucide-react";

import questionsData from "@/data/questions.json";
import { eteExplanations } from "@/lib/eteExplanations";
import type { StoredAttempt } from "@/lib/quizData";

const C = {
  bg:        "#1a1209",
  surface:   "#2a1a0a",
  card:      "#3d2314",
  primary:   "#f6aa1c",
  primaryFg: "#1a1209",
  muted:     "#8a7055",
  mutedFg:   "#c4a882",
  fg:        "#fff8f0",
  success:   "#81c784",
  error:     "#e57373",
  warn:      "#f6aa1c",
};

function getQuestionMap(): Map<string, { text: string; options: Record<string, string>; correctAnswer: string; topic: string; chapterName: string }> {
  const raw = questionsData as any;
  const map = new Map();

  let subjects: any[] = [];
  if (Array.isArray(raw.subjects)) subjects = raw.subjects;
  else if (raw.subject) subjects = [raw.subject];

  for (const s of subjects) {
    for (const c of s.chapters) {
      for (const q of c.questions) {
        map.set(q.id, { text: q.text, options: q.options ?? {}, correctAnswer: q.correctAnswer, topic: q.topic, chapterName: c.name });
      }
    }
  }
  return map;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ScoreCircle({ percentage, size = 140 }: { percentage: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? C.success : percentage >= 50 ? C.warn : C.error;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.card} strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const isLastAttempt = attemptId === "last";

  const [attempt, setAttempt] = useState<StoredAttempt | null>(null);
  const [qMap, setQMap] = useState<Map<string, any> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [expandedWrong, setExpandedWrong] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQMap(getQuestionMap());

    const storageKey = isLastAttempt ? "quizcraft_last_attempt" : "quizcraft_last_attempt";
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setNotFound(true);
      return;
    }
    try {
      const data: StoredAttempt = JSON.parse(stored);
      // Only use this attempt if it matches the requested ID, or if we're looking for "last"
      if (!isLastAttempt && data.id !== attemptId) {
        setNotFound(true);
        return;
      }
      setAttempt(data);
    } catch {
      setNotFound(true);
    }
  }, [attemptId, isLastAttempt]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: C.bg }}>
        <Card className="max-w-md w-full text-center p-8" style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
            No Results Found
          </h2>
          <p className="mb-6" style={{ color: C.mutedFg }}>Take a quiz first to see your results here.</p>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            style={{ backgroundColor: C.primary, color: C.primaryFg, fontFamily: "Lexend, sans-serif" }}
          >
            <Home className="w-4 h-4 mr-2" />Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!attempt || !qMap) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="text-4xl mb-3">⚡</div>
          <p style={{ color: C.mutedFg }}>Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = attempt.percentage ?? (attempt.totalQuestions > 0 ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0);
  const isPassing = percentage >= 70;
  const timeTaken = attempt.timeTaken ?? 0;

  const wrongQuestions = attempt.wrongQuestionIds
    .map((id) => {
      const q = qMap.get(id);
      if (!q) return null;
      const userAnswer = attempt.answers?.[id] ?? "?";
      const explanation = eteExplanations[id] ?? `Review "${q.topic}" for better understanding.`;
      return {
        id,
        text: q.text,
        options: q.options,
        yourAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        chapterName: q.chapterName,
        explanation,
      };
    })
    .filter(Boolean) as Array<{
      id: string; text: string; options: Record<string, string>;
      yourAnswer: string; correctAnswer: string; topic: string; chapterName: string; explanation: string;
    }>;

  const isFasterThanAvg = timeTaken > 0 && timeTaken < attempt.totalQuestions * 45;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: C.bg }}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            style={{ color: C.mutedFg }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
            Quiz Results
          </h1>
        </div>

        {/* Score Card */}
        <Card style={{ backgroundColor: C.surface, border: `1px solid ${isPassing ? C.success : C.warn}` }}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle percentage={percentage} />
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                  <p className="text-sm" style={{ color: C.mutedFg }}>questions correct</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {timeTaken > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.card }}>
                      <Clock className="w-4 h-4" style={{ color: C.primary }} />
                      <span style={{ color: C.fg }}>{formatTime(timeTaken)}</span>
                    </div>
                  )}
                  {isFasterThanAvg && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: `${C.success}22` }}>
                      <TrendingUp className="w-4 h-4" style={{ color: C.success }} />
                      <span style={{ color: C.success }}>Faster than average!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: C.card }}>
                    <Target className="w-4 h-4" style={{ color: C.primary }} />
                    <span style={{ color: C.fg }}>
                      {timeTaken > 0 ? `${Math.round(timeTaken / Math.max(attempt.totalQuestions, 1))}s/question` : `${attempt.totalQuestions} questions`}
                    </span>
                  </div>
                </div>
                <p className="text-3xl">
                  {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weak topics */}
        {attempt.weakTopics && attempt.weakTopics.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
                <BookOpen className="w-4 h-4" style={{ color: C.warn }} />
                Topics to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {attempt.weakTopics.map((t: string) => (
                  <Badge key={t} variant="outline" style={{ borderColor: `${C.warn}66`, color: C.warn }}>
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wrong Answers Review */}
        {wrongQuestions.length > 0 && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}>
                <XCircle className="w-5 h-5" style={{ color: C.error }} />
                Wrong Answers ({wrongQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wrongQuestions.map((wq) => (
                <div
                  key={wq.id}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.card}` }}
                >
                  {/* Question header */}
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() => setExpandedWrong((prev) => ({ ...prev, [wq.id]: !prev[wq.id] }))}
                  >
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.error }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed" style={{ color: C.fg }}>
                        {wq.text}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs" style={{ borderColor: `${C.primary}44`, color: C.mutedFg }}>
                          <BookOpen className="w-3 h-3 mr-1" />
                          {wq.chapterName}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 mt-1 transition-transform"
                      style={{ color: C.mutedFg, transform: expandedWrong[wq.id] ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Expanded detail */}
                  {expandedWrong[wq.id] && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${C.muted}33` }}>

                      {/* Correct vs Your Answer comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: `${C.error}11`, borderLeftColor: C.error }}>
                          <div className="text-xs font-medium mb-1" style={{ color: C.error }}>
                            ✗ Your Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.error }}>
                            {wq.yourAnswer}. {wq.options[wq.yourAnswer]}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: `${C.success}11`, borderLeftColor: C.success }}>
                          <div className="text-xs font-medium mb-1" style={{ color: C.success }}>
                            ✓ Correct Answer
                          </div>
                          <div className="text-sm font-bold" style={{ fontFamily: "Lexend, sans-serif", color: C.success }}>
                            {wq.correctAnswer}. {wq.options[wq.correctAnswer]}
                          </div>
                        </div>
                      </div>

                      {/* All options */}
                      <div className="space-y-2">
                        <div className="text-xs" style={{ color: C.muted }}>All Options</div>
                        {Object.entries(wq.options).map(([key, val]) => {
                          const isCorrect = key === wq.correctAnswer;
                          const isWrongSelected = key === wq.yourAnswer && !isCorrect;
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 rounded-lg border-l-4"
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
                                  backgroundColor: isCorrect ? `${C.success}33` : isWrongSelected ? `${C.error}33` : `${C.muted}22`,
                                  color: isCorrect ? C.success : isWrongSelected ? C.error : C.muted,
                                  fontFamily: "Lexend, sans-serif",
                                }}
                              >
                                {key}
                              </span>
                              <span className="text-sm flex-1" style={{ color: C.fg }}>{val}</span>
                              {isCorrect && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />}
                              {isWrongSelected && <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: C.error }} />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div
                        className="flex gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: `${C.warn}11`, border: `1px solid ${C.warn}33` }}
                      >
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.warn }} />
                        <p className="text-sm" style={{ color: C.mutedFg }}>{wq.explanation}</p>
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
              const retestIds = attempt.wrongQuestionIds.slice(0, 25);
              localStorage.setItem("quizcraft_retest_ids", JSON.stringify(retestIds));
              router.push(`/quiz/${attempt.subjectId}`);
            }}
            disabled={attempt.wrongQuestionIds.length === 0}
            className="w-full min-h-[48px] text-sm"
            style={{ backgroundColor: C.primary, color: C.primaryFg, fontFamily: "Lexend, sans-serif" }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retest Wrong Ones
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("quizcraft_retest_ids");
              router.push(`/quiz/${attempt.subjectId}`);
            }}
            className="w-full min-h-[48px]"
            style={{ borderColor: C.card, color: C.fg, fontFamily: "Lexend, sans-serif" }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Full Retest
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full min-h-[48px]"
            style={{ borderColor: C.card, color: C.fg, fontFamily: "Lexend, sans-serif" }}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}