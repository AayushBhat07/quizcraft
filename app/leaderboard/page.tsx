"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  Hash,
  Loader2,
} from "lucide-react";
import { getLeaderboard, saveAttemptToFirestore } from "@/lib/firebaseHelpers";
import type { StoredAttempt } from "@/lib/quizData";

const C = {
  bg:        "#1a1209",
  surface:   "#2a1a0a",
  surface2:  "#3d2314",
  primary:   "#f6aa1c",
  secondary: "#bc3908",
  accent:    "#941b0c",
  muted:     "#8a7055",
  mutedFg:   "#c4a882",
  fg:        "#fff8f0",
  success:   "#81c784",
  error:     "#e57373",
  warn:      "#f6aa1c",
};

interface LeaderboardEntry {
  id: string;
  name: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: number;
  isCurrentUser?: boolean;
}

const SUBJECT_NAMES: Record<string, string> = {
  ete: "Emerging Trends in Electronics",
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl flex-shrink-0">🥇</span>;
  if (rank === 2) return <span className="text-2xl flex-shrink-0">🥈</span>;
  if (rank === 3) return <span className="text-2xl flex-shrink-0">🥉</span>;
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
      style={{
        backgroundColor: C.surface2,
        color: C.mutedFg,
        fontFamily: "Lexend, sans-serif",
      }}
    >
      {rank}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surface2 }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? C.success : score >= 60 ? C.primary : C.error,
          }}
        />
      </div>
      <span
        className="text-sm font-bold w-10 text-right flex-shrink-0"
        style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
      >
        {score}%
      </span>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFs, setIsUsingFs] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setIsUsingFs(false);

    getLeaderboard(100)
      .then((fsEntries) => {
        if (fsEntries && fsEntries.length > 0) {
          const name = localStorage.getItem('quizcraft_name') || '';
          setUserName(name);
          setIsUsingFs(true);
          const withUser = fsEntries.map((e) => ({
            ...e,
            isCurrentUser: e.name === name && name !== '',
          }));
          setEntries(withUser as LeaderboardEntry[]);
        } else {
          loadLocalEntries();
        }
      })
      .catch(() => {
        loadLocalEntries();
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  function loadLocalEntries() {
    setIsUsingFs(false);
    const raw = localStorage.getItem('quizcraft_attempts');
    if (!raw) { setLocalEntries([]); return; }
    let attempts: StoredAttempt[] = [];
    try {
      attempts = JSON.parse(raw) as StoredAttempt[];
    } catch { setLocalEntries([]); return; }
    const name = localStorage.getItem('quizcraft_name') || '';
    setUserName(name);
    const byName: Record<string, LeaderboardEntry> = {};
    attempts.forEach((a) => {
      const n = a.userName || name || 'You';
      const pct = Math.round((a.score / a.totalQuestions) * 100);
      if (!byName[n] || byName[n].percentage < pct) {
        byName[n] = { id: a.id, name: n, subjectId: a.subjectId, score: a.score, totalQuestions: a.totalQuestions, percentage: pct, timestamp: a.timestamp, isCurrentUser: n === name && name !== '' };
      }
    });
    const sorted = Object.values(byName).sort((a, b) => b.percentage - a.percentage);
    setLocalEntries(sorted);
  }

  useEffect(() => {
    const lastAttemptRaw = localStorage.getItem('quizcraft_last_attempt');
    if (!lastAttemptRaw) return;
    try {
      const attempt: StoredAttempt = JSON.parse(lastAttemptRaw);
      const name = localStorage.getItem('quizcraft_name') || attempt.userName || 'Anonymous';
      const safeSubjectId = (attempt.subjectId || 'ete').replace(/[^\w\s-]/g, '_');
      saveAttemptToFirestore({
        name,
        subjectId: safeSubjectId,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
        weakTopics: attempt.weakTopics || [],
        timestamp: attempt.timestamp,
      }).catch(() => {});
    } catch {}
  }, []);

  // Compute display entries with active tab filter
  const allEntries = isUsingFs ? entries : localEntries;
  const filteredEntries = activeTab === "all"
    ? allEntries
    : allEntries.filter((e) => e.subjectId === activeTab);

  // Rank filtered list
  const rankedEntries = filteredEntries.map((e, idx) => ({ ...e, rank: idx + 1 }));
  const hasCurrentUser = rankedEntries.some((e) => e.isCurrentUser);

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif" }}
    >
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(240,170,28,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
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
            className="text-xl sm:text-2xl font-bold"
            style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
          >
            🏆 Leaderboard
          </h1>
        </div>

        {/* Firestore / Local indicator */}
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit"
          style={{
            backgroundColor: isUsingFs ? `${C.success}22` : `${C.muted}22`,
            color: isUsingFs ? C.success : C.muted,
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: isUsingFs ? C.success : C.muted }}
          />
          {isUsingFs ? "Global · Anyone can contribute" : "Local · Only your device"}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3" style={{ color: C.mutedFg }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading leaderboard...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && rankedEntries.length === 0 && (
          <Card
            className="p-6 sm:p-8 text-center"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.surface2}` }}
          >
            <div className="text-4xl sm:text-5xl mb-4">📋</div>
            <h3
              className="text-lg sm:text-xl font-semibold mb-2"
              style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
            >
              No scores yet
            </h3>
            <p className="mb-6 text-sm sm:text-base" style={{ color: C.mutedFg }}>
              Be the first to take a quiz and claim the #1 spot!
            </p>
            <Button
              onClick={() => router.push("/")}
              size="sm"
              style={{
                backgroundColor: C.primary,
                color: C.bg,
                fontFamily: "Lexend, sans-serif",
              }}
            >
              Take Your First Quiz
            </Button>
          </Card>
        )}

        {/* Tabs + Leaderboard */}
        {!isLoading && rankedEntries.length > 0 && (
          <>
            {/* Subject filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList
                className="flex flex-wrap gap-1"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.surface2}`,
                }}
              >
                <TabsTrigger
                  value="all"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                  style={{
                    fontFamily: "Lexend, sans-serif",
                    color: activeTab === "all" ? C.fg : C.mutedFg,
                  }}
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                {/* Dynamic subject tabs */}
                {[...Array.from(new Map(allEntries.map(e => [e.subjectId, e])).entries())].map(([sid]) => (
                  <TabsTrigger
                    key={sid}
                    value={sid}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 max-w-[120px] sm:max-w-[200px] truncate"
                    style={{
                      fontFamily: "Lexend, sans-serif",
                      color: activeTab === sid ? C.fg : C.mutedFg,
                    }}
                  >
                    {SUBJECT_NAMES[sid] || sid}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-3">
                {rankedEntries.map((entry) => {
                  const rank = entry.rank;
                  return (
                    <Card
                      key={entry.id || entry.name + entry.timestamp}
                      style={{
                        backgroundColor: C.surface,
                        border: entry.isCurrentUser
                          ? `2px solid ${C.primary}`
                          : `1px solid ${C.surface2}`,
                      }}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* Mobile layout: row with all info, score bar below name+meta on sm+ */}
                        <div className="flex items-start gap-2 sm:gap-3">
                          <RankMedal rank={rank} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-semibold text-sm sm:text-base max-w-[120px] sm:max-w-[200px] truncate"
                                style={{
                                  fontFamily: "Lexend, sans-serif",
                                  color: entry.isCurrentUser ? C.primary : C.fg,
                                }}
                              >
                                {entry.name}
                              </span>
                              {entry.isCurrentUser && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] sm:text-xs px-1.5 py-0.5 flex-shrink-0"
                                  style={{
                                    borderColor: C.primary,
                                    color: C.primary,
                                  }}
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                            <div
                              className="flex items-center gap-1.5 sm:gap-3 mt-1 text-[10px] sm:text-xs flex-wrap"
                              style={{ color: C.mutedFg }}
                            >
                              <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                {entry.score}/{entry.totalQuestions}
                              </span>
                              <span className="flex-shrink-0">{timeAgo(entry.timestamp)}</span>
                              <span className="hidden sm:flex-shrink-0">{formatDate(entry.timestamp)}</span>
                            </div>
                          </div>

                          <div className="w-20 sm:w-32 flex-shrink-0 pt-0.5">
                            <ScoreBar score={entry.percentage} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>

            {/* Your rank summary */}
            {hasCurrentUser && (
              <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.surface2}` }}>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm" style={{ color: C.mutedFg }}>
                    Your best score:{" "}
                    <span
                      className="font-bold"
                      style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                    >
                      {rankedEntries.find((e) => e.isCurrentUser)?.percentage ?? "—"}%
                    </span>{" "}
                    · Rank #{" "}
                    <span
                      className="font-bold"
                      style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                    >
                      {rankedEntries.find((e) => e.isCurrentUser)?.rank ?? "—"}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* CTA */}
        <Button
          onClick={() => router.push("/")}
          className="w-full text-sm sm:text-base"
          style={{
            backgroundColor: C.primary,
            color: C.bg,
            fontFamily: "Lexend, sans-serif",
          }}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Take a Quiz to Improve Your Rank
        </Button>
      </div>
    </div>
  );
}
