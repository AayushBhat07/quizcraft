"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  CheckCircle,
  XCircle,
  Settings2,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import {
  getSubject,
  getChapters,
  getTotalQuestionCount,
  buildQuizPool,
  saveQuizPrefs,
  loadQuizPrefs,
  saveAttempt,
  computeQuizResult,
  updateUserStatsAfterQuiz,
  getUserStats,
  saveIncompleteAttempt,
  loadIncompleteAttempt,
  clearIncompleteAttempt,
  type QuizQuestion,
  type QuizPrefs,
  type StoredAttempt,
  type IncompleteAttempt,
} from "@/lib/quizData";
import { saveAttemptToFirestore } from "@/lib/firebaseHelpers";
import { eteExplanations } from "@/lib/eteExplanations";

// ─── Fisher-Yates shuffle (local) ────────────────
function shuffleInPlace<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Quiz phases ──────────────────────────────────
type Phase = "setup" | "quiz" | "complete";

const QUESTION_COUNTS = [10, 25, 50] as const;
const TIMER_SECS = 60;

// ─── Styles (inline for the new palette) ──────────
const s = {
  bg:        "#1a1209",
  card:      "#2a1a0a",
  cardBorder:"#3d2314",
  primary:   "#f6aa1c",
  primaryFg: "#1a1209",
  muted:     "#8a7055",
  mutedFg:   "#c4a882",
  fg:        "#fff8f0",
  success:   "#81c784",
  error:     "#e57373",
  warn:      "#f6aa1c",
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subject as string;

  // ─── State ────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("setup");
  const [subject, setSubject] = useState(getSubject(subjectId));
  const [prefs, setPrefs] = useState<QuizPrefs>(() => loadQuizPrefs(subjectId));
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [timerActive, setTimerActive] = useState(false);
  const [questionCount] = useState(getTotalQuestionCount(subjectId));
  const [startTime] = useState<number>(() => Date.now());
  const userStats = getUserStats();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Redirect if no name set ───────────────────
  useEffect(() => {
    if (!localStorage.getItem("quizcraft_name")) {
      router.replace("/");
    }
    // Reset phase when subject changes (only on initial mount, not on resume navigation)
    setPhase("setup");
    setQuizQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, subjectId]);

  // ─── Handle resume from incomplete attempt ───────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") === "true") {
      const incomplete = loadIncompleteAttempt();
      if (incomplete && incomplete.subjectId === subjectId) {
        setQuizQuestions(incomplete.quizQuestions);
        setCurrentIdx(incomplete.currentIdx);
        setAnswers(incomplete.answers);
        setSelectedAnswer(incomplete.selectedAnswer);
        setTimeLeft(TIMER_SECS);
        setTimerActive(false);
        setPhase("quiz");
        // Clear URL param
        window.history.replaceState({}, "", `/quiz/${subjectId}`);
      }
    }
  }, [subjectId]);

  // ─── Save incomplete attempt on answer selection ───────────────────
  useEffect(() => {
    if (phase !== "quiz" || quizQuestions.length === 0) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 1) return;
    const userName = localStorage.getItem("quizcraft_name") ?? "";
    saveIncompleteAttempt({
      subjectId,
      quizQuestions,
      answers,
      currentIdx,
      selectedAnswer,
      timestamp: Date.now(),
      userName,
    });
  }, [answers, currentIdx, selectedAnswer, phase, quizQuestions, subjectId]);

  // ─── Name validation ───────────────────────────
  const userName = localStorage.getItem("quizcraft_name") ?? "";


  // ─── Save incomplete attempt on mount/unmount ─────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phase === "quiz" && quizQuestions.length > 0 && Object.keys(answers).length > 0) {
        const userName = localStorage.getItem("quizcraft_name") ?? "";
        saveIncompleteAttempt({
          subjectId,
          quizQuestions,
          answers,
          currentIdx,
          selectedAnswer,
          timestamp: Date.now(),
          userName,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also save on normal unmount (navigating away mid-quiz)
      if (phase === "quiz" && quizQuestions.length > 0 && Object.keys(answers).length > 0) {
        const userName = localStorage.getItem("quizcraft_name") ?? "";
        saveIncompleteAttempt({
          subjectId,
          quizQuestions,
          answers,
          currentIdx,
          selectedAnswer,
          timestamp: Date.now(),
          userName,
        });
      }
    };
  }, [phase, quizQuestions, answers, currentIdx, selectedAnswer, subjectId]);

  // ─── Timer logic ──────────────────────────────
  const startTimer = useCallback(() => {
    setTimeLeft(TIMER_SECS);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECS);
  }, [stopTimer]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && phase === "quiz") {
      handleAutoNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ─── Chapter selection helpers ────────────────
  const chapters = subject?.chapters ?? [];
  const totalQuestions = questionCount;

  const toggleChapter = (chapterId: string) => {
    setPrefs((p) => {
      const selected = p.selectedChapters.includes(chapterId)
        ? p.selectedChapters.filter((id) => id !== chapterId)
        : [...p.selectedChapters, chapterId];
      return { ...p, selectedChapters: selected };
    });
  };

  const selectAllChapters = () => {
    setPrefs((p) => ({ ...p, selectedChapters: chapters.map((c) => c.id) }));
  };

  const deselectAllChapters = () => {
    setPrefs((p) => ({ ...p, selectedChapters: [] }));
  };

  // ─── Available question count options ───────────
  const countOptions: (number | "all")[] = [
    ...QUESTION_COUNTS,
    totalQuestions,
  ];

  // ─── Start quiz ────────────────────────────────
  const handleStartQuiz = () => {
    saveQuizPrefs(prefs);
    const pool = buildQuizPool(subjectId, prefs);
    if (!pool.length) {
      alert("No questions available for selected chapters. Please select at least one chapter.");
      return;
    }
    const questions = pool.slice(0, prefs.questionCount > 0 ? prefs.questionCount : pool.length);
    setQuizQuestions(questions);
    setCurrentIdx(0);
    setAnswers({});
    setSelectedAnswer(null);
    setPhase("quiz");
    startTimer();
  };

  // ─── Auto-advance after answer selection ───────
  const handleAutoNext = useCallback(() => {
    setQuizQuestions((prev) => {
      if (currentIdx >= prev.length - 1) {
        // Last question — go to complete
        stopTimer();
        setPhase("complete");
        return prev;
      }
      setCurrentIdx((idx) => idx + 1);
      setSelectedAnswer(null);
      resetTimer();
      startTimer();
      return prev;
    });
  }, [currentIdx, stopTimer, resetTimer, startTimer]);

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
    const q = quizQuestions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
    // Auto-advance after 500ms
    setTimeout(() => {
      handleAutoNext();
    }, 500);
  };

  // ─── Submit quiz ────────────────────────────────
  const handleSubmitQuiz = () => {
    stopTimer();
    const result = computeQuizResult(quizQuestions, answers);
    const userName = localStorage.getItem("quizcraft_name") ?? "";

    const endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime) / 1000);

    const storedAttempt: StoredAttempt = {
      id: result.attemptId,
      userName,
      subjectId,
      score: result.score,
      totalQuestions: result.total,
      wrongQuestionIds: result.wrongQuestionIds,
      weakTopics: result.weakTopics,
      timestamp: Date.now(),
      completed: true,
      answers,
      questionCount: quizQuestions.length,
      timeTaken,
      percentage: result.percentage,
    };

    saveAttempt(storedAttempt);
    clearIncompleteAttempt();
    localStorage.setItem("quizcraft_last_attempt", JSON.stringify(storedAttempt));
    // Also save to quizcraft_attempts array for home page stats
    const existingAttempts = JSON.parse(localStorage.getItem("quizcraft_attempts") || "[]");
    existingAttempts.unshift(storedAttempt);
    localStorage.setItem("quizcraft_attempts", JSON.stringify(existingAttempts));
    updateUserStatsAfterQuiz(result.score, result.total, result.weakTopics);

    // Save anonymous attempt to global leaderboard (non-blocking)
    saveAttemptToFirestore({
      name: userName,
      subjectId,
      score: result.score,
      totalQuestions: result.total,
      percentage: Math.round((result.score / result.total) * 100),
      weakTopics: result.weakTopics,
      timestamp: Date.now(),
    }).catch(console.warn);

    // Store result for results page
    localStorage.setItem("quizcraft_last_result", JSON.stringify(result));
    setPhase("complete");
  };

  // ─── Computed values ────────────────────────────
  const currentQuestion = quizQuestions[currentIdx];
  const progress = quizQuestions.length > 0
    ? ((currentIdx + 1) / quizQuestions.length) * 100
    : 0;
  const score = Object.entries(answers).filter(([qId, ans]) => {
    const q = quizQuestions.find((q) => q.id === qId);
    return q && q.correctAnswer === ans;
  }).length;
  const timerDanger = timeLeft <= 15;
  const isLastQuestion = currentIdx === quizQuestions.length - 1;

  // ─── Countdown timer display ──────────────────
  const timerDisplay = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  // ─── Setup screen ───────────────────────────────
  if (phase === "setup") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: s.bg }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-6 left-6"
          style={{ color: s.mutedFg }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card
          className="w-full max-w-lg"
          style={{ backgroundColor: s.card, borderColor: s.cardBorder }}
        >
          <CardHeader className="text-center pb-2">
            <div className="text-5xl mb-3">⚡</div>
            <CardTitle className="text-2xl capitalize" style={{ color: s.fg }}>
              {subject?.name ?? subjectId} Quiz
            </CardTitle>
            <p className="text-sm mt-1" style={{ color: s.mutedFg }}>
              {totalQuestions} questions across {chapters.length} chapters
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: s.bg }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: s.muted }}>Player</p>
              <p className="text-lg font-semibold" style={{ color: s.primary }}>{userName}</p>
            </div>

            {/* Question count selector */}
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: s.mutedFg }}>
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPrefs((p) => ({ ...p, questionCount: n }))}
                    className="py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[48px]"
                    style={{
                      backgroundColor: prefs.questionCount === n ? s.primary : s.bg,
                      color: prefs.questionCount === n ? s.primaryFg : s.mutedFg,
                      border: `1px solid ${prefs.questionCount === n ? s.primary : s.cardBorder}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPrefs((p) => ({ ...p, questionCount: totalQuestions }))}
                  className="py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[48px]"
                  style={{
                    backgroundColor: prefs.questionCount === totalQuestions ? s.primary : s.bg,
                    color: prefs.questionCount === totalQuestions ? s.primaryFg : s.mutedFg,
                    border: `1px solid ${prefs.questionCount === totalQuestions ? s.primary : s.cardBorder}`,
                  }}
                >
                  All ({totalQuestions})
                </button>
              </div>
            </div>

            {/* Chapter filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: s.mutedFg }}>
                  Chapters
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllChapters}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: s.primary, border: `1px solid ${s.primary}`, background: "transparent" }}
                  >
                    All
                  </button>
                  <button
                    onClick={deselectAllChapters}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: s.muted, border: `1px solid ${s.muted}`, background: "transparent" }}
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {chapters.map((ch) => {
                  const selected = prefs.selectedChapters.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChapter(ch.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all min-h-[48px]"
                      style={{
                        backgroundColor: selected ? "rgba(172,159,187,0.1)" : s.bg,
                        border: `1px solid ${selected ? s.primary : s.cardBorder}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: selected ? s.primary : "transparent",
                          border: `1.5px solid ${selected ? s.primary : s.cardBorder}`,
                        }}
                      >
                        {selected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke={s.primaryFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: s.fg }}>{ch.name}</p>
                        <p className="text-xs" style={{ color: s.muted }}>{ch.questions.length} questions</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 py-3" style={{ borderTop: `1px solid ${s.cardBorder}`, borderBottom: `1px solid ${s.cardBorder}` }}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1" style={{ color: s.muted }}>
                  <Target className="w-3 h-3" />
                  <span className="text-xs">Questions</span>
                </div>
                <p className="text-lg font-bold mt-1" style={{ color: s.fg }}>
                  {Math.min(prefs.questionCount, totalQuestions)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1" style={{ color: s.muted }}>
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">Per Question</span>
                </div>
                <p className="text-lg font-bold mt-1" style={{ color: s.fg }}>60s</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1" style={{ color: s.muted }}>
                  <Trophy className="w-3 h-3" />
                  <span className="text-xs">Passing</span>
                </div>
                <p className="text-lg font-bold mt-1" style={{ color: s.fg }}>70%</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full text-base font-semibold"
              style={{ backgroundColor: s.primary, color: s.primaryFg }}
              onClick={handleStartQuiz}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Quiz complete screen ───────────────────────
  if (phase === "complete") {
    const result = computeQuizResult(quizQuestions, answers);
    const pct = result.percentage;
    const isPassing = pct >= 70;

    return (
      <div
        className="min-h-screen p-6 flex flex-col items-center justify-center"
        style={{ backgroundColor: s.bg }}
      >
        <Card
          className="w-full max-w-lg"
          style={{ backgroundColor: s.card, borderColor: isPassing ? s.success : s.warn }}
        >
          <CardHeader className="text-center pb-2">
            <div className="text-6xl mb-3">{isPassing ? "🎉" : "📚"}</div>
            <CardTitle className="text-3xl" style={{ color: s.fg }}>Quiz Complete!</CardTitle>
            <p className="text-sm" style={{ color: s.mutedFg }}>
              You scored <strong style={{ color: s.primary }}>{result.score}</strong> out of{" "}
              <strong style={{ color: s.primary }}>{result.total}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score ring */}
            <div className="flex justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke={s.cardBorder} strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="44"
                    stroke={isPassing ? s.success : s.warn}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(pct / 100) * 276.46} 276.46`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: s.fg }}>{pct}%</span>
                </div>
              </div>
            </div>

            {/* Weak topics */}
            {result.weakTopics.length > 0 && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: s.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4" style={{ color: s.warn }} />
                  <p className="text-sm font-medium" style={{ color: s.warn }}>Topics to Improve</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.weakTopics.map((t) => (
                    <Badge key={t} variant="outline" style={{ color: s.warn, borderColor: s.warn }}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: s.primary, color: s.primaryFg }}
                onClick={() => router.push("/results/last")}
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answers review */}
        <Card
          className="w-full max-w-lg mt-4"
          style={{ backgroundColor: s.card, borderColor: s.cardBorder }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: s.fg }}>Answers Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quizQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              const explanation = eteExplanations[q.id];
              return (
                <div
                  key={q.id}
                  className="flex flex-col gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: s.bg }}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCorrect
                        ? <CheckCircle className="w-5 h-5" style={{ color: s.success }} />
                        : <XCircle className="w-5 h-5" style={{ color: s.error }} />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: s.fg }}>
                        Q{idx + 1}: {q.text}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col gap-1.5 pl-8">
                    {Object.entries(q.options ?? {}).map(([key, val]) => {
                      const isCorrectOption = key === q.correctAnswer;
                      const isWrongSelected = key === userAns && !isCorrect;

                      if (isCorrectOption) {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: `${s.success}22`, border: `1px solid ${s.success}66` }}
                          >
                            <span className="font-bold text-sm" style={{ color: s.success }}>✅</span>
                            <span className="text-sm font-medium" style={{ color: s.success }}>
                              {key}. {val}
                            </span>
                          </div>
                        );
                      } else if (isWrongSelected) {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: `${s.error}22`, border: `1px solid ${s.error}66` }}
                          >
                            <span className="font-bold text-sm" style={{ color: s.error }}>❌</span>
                            <span className="text-sm font-medium line-through" style={{ color: s.error }}>
                              {key}. {val}
                            </span>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: `${s.muted}11`, border: `1px solid ${s.cardBorder}` }}
                          >
                            <span className="text-sm" style={{ color: s.mutedFg }}>{key}. {val}</span>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* Explanation for wrong answers */}
                  {!isCorrect && explanation && (
                    <div
                      className="flex gap-2 px-3 py-2 rounded-lg ml-8 text-xs"
                      style={{ backgroundColor: `${s.warn}15`, border: `1px solid ${s.warn}44` }}
                    >
                      <span style={{ color: s.warn }}>💡</span>
                      <span style={{ color: s.mutedFg }}>{explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Quiz screen ────────────────────────────────
  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ backgroundColor: s.bg }}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                stopTimer();
                setPhase("setup");
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="font-semibold capitalize" style={{ color: s.fg }}>
                {subject?.name ?? subjectId}
              </p>
              <p className="text-sm" style={{ color: s.mutedFg }}>
                Question {currentIdx + 1} of {quizQuestions.length}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold"
            style={{
              backgroundColor: timerDanger
                ? "rgba(229,115,115,0.15)"
                : "rgba(172,159,187,0.1)",
              color: timerDanger ? s.error : s.primary,
              border: `1px solid ${timerDanger ? s.error : s.cardBorder}`,
            }}
          >
            <Clock className="w-5 h-5" />
            {timerDisplay}
          </div>
        </div>

        {/* Progress */}
        <Progress
          value={progress}
          className="h-1.5"
          style={{
            // @ts-ignore
            "--tw-border-opacity": "1",
          }}
        />

        {/* Progress dots */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {quizQuestions.map((q, idx) => {
            const answered = !!answers[q.id];
            const current = idx === currentIdx;
            let dotColor = s.cardBorder;
            if (answered) dotColor = s.success;
            if (current) dotColor = s.primary;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setSelectedAnswer(answers[q.id] ?? null);
                  resetTimer();
                  startTimer();
                }}
                className="w-3 h-3 rounded-full transition-all"
                style={{ backgroundColor: dotColor }}
              />
            );
          })}
        </div>

        {/* Question card */}
        <Card
          className="border"
          style={{ backgroundColor: s.card, borderColor: s.cardBorder }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                style={{ color: s.mutedFg, borderColor: s.cardBorder, backgroundColor: s.bg }}
              >
                <BookOpen className="w-3 h-3 mr-1" />
                {currentQuestion?.topic ?? "General"}
              </Badge>
              <Badge
                variant="outline"
                style={{ color: s.mutedFg, borderColor: s.cardBorder }}
              >
                <Target className="w-3 h-3 mr-1" />
                Score: {score}/{currentIdx}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-xl font-medium leading-relaxed" style={{ color: s.fg }}>
              {currentQuestion?.text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion &&
                Object.entries(currentQuestion.options ?? {}).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAnswer(key)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all min-h-[48px]"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(172,159,187,0.15)"
                          : s.bg,
                        border: `1.5px solid ${
                          isSelected ? s.primary : s.cardBorder
                        }`,
                      }}
                    >
                      <span
                        className="font-bold text-base w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? s.primary : "transparent",
                          color: isSelected ? s.primaryFg : s.mutedFg,
                          border: `1.5px solid ${isSelected ? s.primary : s.cardBorder}`,
                          minHeight: "2rem",
                        }}
                      >
                        {key}
                      </span>
                      <span className="text-base" style={{ color: s.fg }}>{value}</span>
                    </button>
                  );
                })}
            </div>

            {/* Submit button (last question only when answered) */}
            {isLastQuestion && selectedAnswer && (
              <Button
                size="lg"
                className="w-full text-base font-semibold"
                style={{ backgroundColor: s.primary, color: s.primaryFg }}
                onClick={handleSubmitQuiz}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Submit Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
