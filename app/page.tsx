"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Trophy, TrendingUp, Zap, Target, Flame } from "lucide-react";
import questionsData from "@/data/questions.json";

// ─── NEW WARM FIRE PALETTE ────────────────────────
const C = {
  bg:        "#1a1209",  // deep warm black
  surface:   "#2a1a0a",  // dark warm brown
  card:      "#3d2314",  // warm card surface
  primary:   "#f6aa1c",  // golden amber
  secondary: "#bc3908",  // orange-red
  accent:    "#941b0c",  // deep red
  muted:     "#8a7055",  // warm grey-brown
  mutedFg:   "#c4a882",  // light warm tan
  fg:        "#fff8f0",  // warm white
  success:   "#81c784",  // green
};

const ALL_SUBJECTS = questionsData.subjects;

export default function HomePage() {
  const [name, setName] = useState("");
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  const [userStats, setUserStats] = useState<{ totalQuizzes: number; bestScore: number; avgScore: number } | null>(null);
  const router = useRouter();

  const SELECTED_SUBJECT = ALL_SUBJECTS[selectedSubjectIdx];
  const CHAPTERS = SELECTED_SUBJECT.chapters.map(ch => ({
    name: ch.name,
    questions: ch.questions.length,
    id: ch.id
  }));
  const TOTAL_QUESTIONS = CHAPTERS.reduce((s, c) => s + c.questions, 0);

  const loadStats = () => {
    const storedName = localStorage.getItem("quizcraft_name");
    if (storedName) setName(storedName);
    else return;

    const attempts = JSON.parse(localStorage.getItem("quizcraft_attempts") || "[]");
    if (attempts.length > 0) {
      const scores = attempts.map((a: any) => Math.round((a.score / a.totalQuestions) * 100));
      const best = Math.max(...scores);
      const avg = Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length);
      setUserStats({ totalQuizzes: attempts.length, bestScore: best, avgScore: avg });
    } else {
      // No quizzes yet — show name with placeholder stats
      setUserStats({ totalQuizzes: 0, bestScore: 0, avgScore: 0 });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Re-load stats when returning from quiz (navigation without full reload)
  useEffect(() => {
    const handleShowStats = () => loadStats();
    window.addEventListener("focus", handleShowStats);
    return () => window.removeEventListener("focus", handleShowStats);
  }, []);

  const handleStartQuiz = () => {
    const finalName = name.trim() || "Anonymous";
    localStorage.setItem("quizcraft_name", finalName);
    const subj = ALL_SUBJECTS[selectedSubjectIdx];
    localStorage.setItem("quizcraft_subject", subj.id);
    router.push(`/quiz/${subj.id}?name=${encodeURIComponent(finalName)}`);
  };

  const hasData = userStats !== null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      {/* Warm atmospheric gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(188,57,8,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(246,170,28,0.05) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
          {/* ── SPLIT SCREEN LAYOUT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full items-start">

            {/* ── LEFT PANEL (2/5 width) ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Logo + Wordmark */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: C.primary }}
                >
                  🔥
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold leading-tight"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                  >
                    QuizCraft
                  </h1>
                  <p className="text-sm" style={{ color: C.mutedFg }}>
                    Emerging Trends in Electronics
                  </p>
                </div>
              </div>

              {/* Name Input Card */}
              <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: C.mutedFg, fontFamily: "Lexend, sans-serif" }}
                    >
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base"
                      style={{
                        backgroundColor: C.card,
                        borderColor: C.card,
                        color: C.fg,
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </div>

                  {name.trim() && (
                    <p className="text-sm" style={{ color: C.primary }}>
                      ✓ Ready to quiz, <strong>{name.trim()}</strong>!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Chapter List */}
              <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.mutedFg }}>Subject</span>
                    <select
                      value={selectedSubjectIdx}
                      onChange={e => setSelectedSubjectIdx(Number(e.target.value))}
                      className="text-xs px-2 py-1 rounded-md border"
                      style={{
                        backgroundColor: C.card,
                        color: C.fg,
                        borderColor: `${C.primary}40`,
                        fontFamily: "Lexend, sans-serif",
                      }}
                    >
                      {ALL_SUBJECTS.map((s, i) => (
                        <option key={s.id} value={i}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <CardTitle
                    className="text-sm"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.mutedFg }}
                  >
                    {CHAPTERS.length} Chapters · {TOTAL_QUESTIONS} Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all hover:scale-[1.01]"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid transparent`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = `${C.primary}15`;
                        (e.currentTarget as HTMLElement).style.borderColor = `${C.primary}40`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                      }}
                      onClick={() => {
                        const subj = ALL_SUBJECTS[selectedSubjectIdx];
                        localStorage.setItem("quizcraft_selected_chapters", JSON.stringify([ch.id]));
                        localStorage.setItem("quizcraft_subject", subj.id);
                        router.push(`/quiz/${subj.id}?name=${encodeURIComponent(name.trim() || "Anonymous")}`);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: `${C.primary}25`,
                            color: C.primary,
                            fontFamily: "Lexend, sans-serif",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm" style={{ color: C.fg }}>{ch.name}</span>
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: C.mutedFg }}
                      >
                        {ch.questions} Qs
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Start Button */}
              <Button
                onClick={handleStartQuiz}
                disabled={!name.trim()}
                className="w-full h-14 text-base font-semibold transition-all hover:brightness-110 disabled:opacity-40"
                style={{
                  backgroundColor: C.primary,
                  color: C.bg,
                  fontFamily: "Lexend, sans-serif",
                }}
              >
                {name.trim() ? (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Start Quiz — All Chapters
                  </>
                ) : (
                  "Enter your name to begin"
                )}
              </Button>
            </div>

            {/* ── RIGHT PANEL (3/5 width) ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Total Quizzes */}
                <Card
                  className="text-center p-5"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${C.primary}20` }}
                  >
                    <Target className="w-5 h-5" style={{ color: C.primary }} />
                  </div>
                  {hasData ? (
                    <>
                      <p
                        className="text-2xl font-bold"
                        style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                      >
                        {userStats.totalQuizzes}
                      </p>
                      <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Quizzes Taken</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
                  )}
                </Card>

                {/* Best Score */}
                <Card
                  className="text-center p-5"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${C.success}20` }}
                  >
                    <Trophy className="w-5 h-5" style={{ color: C.success }} />
                  </div>
                  {hasData ? (
                    <>
                      <p
                        className="text-2xl font-bold"
                        style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                      >
                        {userStats.bestScore}%
                      </p>
                      <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Best Score</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
                  )}
                </Card>

                {/* Avg Score */}
                <Card
                  className="text-center p-5"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${C.secondary}20` }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: C.secondary }} />
                  </div>
                  {hasData ? (
                    <>
                      <p
                        className="text-2xl font-bold"
                        style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                      >
                        {userStats.avgScore}%
                      </p>
                      <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Avg Score</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
                  )}
                </Card>
              </div>

              {/* Progress / Empty State Card */}
              <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
                <CardHeader>
                  <CardTitle
                    className="text-base"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                  >
                    {name.trim() ? `${name.trim()}'s Progress` : "Your Progress"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <div className="space-y-4">
                      {/* Score ring visual */}
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" stroke={C.card} strokeWidth="8" fill="none" />
                            <circle
                              cx="50" cy="50" r="42"
                              stroke={C.primary}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(userStats.avgScore / 100) * 263.9} 263.9`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-lg font-bold"
                              style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                            >
                              {userStats.avgScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: C.mutedFg }}>Quizzes</span>
                            <span style={{ color: C.fg, fontFamily: "Lexend, sans-serif" }}>{userStats.totalQuizzes}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: C.mutedFg }}>Best</span>
                            <span style={{ color: C.primary, fontFamily: "Lexend, sans-serif" }}>{userStats.bestScore}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: C.mutedFg }}>Average</span>
                            <span style={{ color: C.fg, fontFamily: "Lexend, sans-serif" }}>{userStats.avgScore}%</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        style={{
                          borderColor: `${C.primary}50`,
                          color: C.primary,
                          fontFamily: "Lexend, sans-serif",
                        }}
                        onClick={() => router.push("/leaderboard")}
                      >
                        View Full Leaderboard →
                      </Button>
                    </div>
                  ) : (
                    /* Empty state */
                    <div className="text-center py-6">
                      <div
                        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${C.primary}15` }}
                      >
                        🔥
                      </div>
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                      >
                        {name.trim() ? "Ready to begin?" : "Start your journey"}
                      </h3>
                      <p className="text-sm mb-5" style={{ color: C.mutedFg }}>
                        {name.trim()
                          ? "Take your first quiz and your stats will appear here."
                          : "Enter your name above and take your first quiz to start tracking progress."}
                      </p>
                      <Button
                        onClick={handleStartQuiz}
                        className="text-sm"
                        style={{
                          backgroundColor: C.primary,
                          color: C.bg,
                          fontFamily: "Lexend, sans-serif",
                        }}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {name.trim() ? "Take Your First Quiz" : "Get Started"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{
                    borderColor: C.card,
                    color: C.mutedFg,
                    fontFamily: "Lexend, sans-serif",
                    backgroundColor: C.surface,
                  }}
                  onClick={() => router.push("/leaderboard")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{
                    borderColor: C.card,
                    color: C.mutedFg,
                    fontFamily: "Lexend, sans-serif",
                    backgroundColor: C.surface,
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  All Questions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}