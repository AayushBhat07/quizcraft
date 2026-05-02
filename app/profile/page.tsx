"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
  Flame,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import type { StoredAttempt } from "@/lib/quizData";

const C = {
  bg:        "#1a1209",
  surface:   "#2a1a0a",
  card:      "#3d2314",
  primary:   "#f6aa1c",
  primaryFg: "#1a1209",
  secondary: "#bc3908",
  muted:     "#8a7055",
  mutedFg:   "#c4a882",
  fg:        "#fff8f0",
  success:   "#81c784",
  error:     "#e57373",
  warn:      "#f6aa1c",
};

const SUBJECT_NAMES: Record<string, string> = {
  ete: "Emerging Trends in Electronics",
};

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getScoreColor(pct: number): string {
  if (pct >= 80) return C.success;
  if (pct >= 60) return C.primary;
  return C.error;
}

function ScoreBar({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.card }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right" style={{ fontFamily: "Lexend, sans-serif", color }}>
        {score}%
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [stats, setStats] = useState<{
    totalQuizzes: number;
    bestScore: number;
    avgScore: number;
  } | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("quizcraft_name") || "";
    setUserName(name);

    const storedAttempts = localStorage.getItem("quizcraft_attempts");
    const parsed: StoredAttempt[] = storedAttempts ? JSON.parse(storedAttempts) : [];

    if (parsed.length > 0) {
      const percentages = parsed.map((a) =>
        a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0
      );
      const best = Math.max(...percentages);
      const avg = Math.round(percentages.reduce((s, v) => s + v, 0) / percentages.length);
      setStats({ totalQuizzes: parsed.length, bestScore: best, avgScore: avg });
    } else {
      setStats({ totalQuizzes: 0, bestScore: 0, avgScore: 0 });
    }

    setAttempts(parsed);
  }, []);

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
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
          >
            👤 Profile
          </h1>
        </div>

        {/* User name card */}
        <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${C.primary}25` }}
              >
                👋
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: C.muted }}>
                  Player
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                >
                  {userName || "Anonymous"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
            <CardContent className="p-5 text-center">
              <div
                className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${C.primary}20` }}
              >
                <Target className="w-5 h-5" style={{ color: C.primary }} />
              </div>
              {stats ? (
                <>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                  >
                    {stats.totalQuizzes}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Quizzes Taken</p>
                </>
              ) : (
                <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
            <CardContent className="p-5 text-center">
              <div
                className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${C.success}20` }}
              >
                <Trophy className="w-5 h-5" style={{ color: C.success }} />
              </div>
              {stats ? (
                <>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                  >
                    {stats.bestScore}%
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Best Score</p>
                </>
              ) : (
                <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
            <CardContent className="p-5 text-center">
              <div
                className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${C.secondary}20` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: C.secondary }} />
              </div>
              {stats ? (
                <>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                  >
                    {stats.avgScore}%
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Average</p>
                </>
              ) : (
                <p className="text-2xl font-bold" style={{ color: C.muted }}>—</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quiz history */}
        <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}>
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
            >
              📋 Quiz History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm" style={{ color: C.mutedFg }}>
                  No quizzes taken yet.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="mt-4"
                  style={{
                    backgroundColor: C.primary,
                    color: C.primaryFg,
                    fontFamily: "Lexend, sans-serif",
                  }}
                >
                  Take Your First Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt, idx) => {
                  const pct = attempt.percentage ?? (
                    attempt.totalQuestions > 0
                      ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                      : 0
                  );
                  const color = getScoreColor(pct);
                  return (
                    <button
                      key={attempt.id || idx}
                      className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
                      style={{
                        backgroundColor: C.card,
                        border: `1px solid ${C.card}`,
                      }}
                      onClick={() => {
                        localStorage.setItem("quizcraft_last_attempt", JSON.stringify(attempt));
                        router.push("/results/last");
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${C.primary}50`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = C.card;
                      }}
                    >
                      {/* Score badge */}
                      <div
                        className="w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}22` }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ fontFamily: "Lexend, sans-serif", color }}
                        >
                          {pct}%
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-semibold"
                            style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                          >
                            {SUBJECT_NAMES[attempt.subjectId] || attempt.subjectId}
                          </span>
                          {idx === 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: C.primary, color: C.primary }}
                            >
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-3 mt-1 text-xs"
                          style={{ color: C.mutedFg }}
                        >
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {attempt.score}/{attempt.totalQuestions}
                          </span>
                          {attempt.timeTaken && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(attempt.timeTaken)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(attempt.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Score bar (desktop) */}
                      <div className="hidden sm:block w-32">
                        <ScoreBar score={pct} />
                      </div>

                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
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
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}