"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Medal,
  TrendingUp,
  Calendar,
  Hash,
} from "lucide-react";
import type { StoredAttempt } from "@/lib/quizData";

// ─── NEW PALETTE (warm fire tones) ─────────────────
const C = {
  bg:        "#1a1209",  // deep warm black
  surface:   "#2a1a0a",  // dark warm brown
  surface2:  "#3d2314",  // lighter warm card
  primary:   "#f6aa1c",  // golden amber  ← main accent
  secondary: "#bc3908",  // orange-red
  accent:    "#941b0c",  // deep red
  muted:     "#8a7055",  // warm grey-brown
  mutedFg:   "#c4a882",  // light warm tan
  fg:        "#fff8f0",  // warm white
  success:   "#81c784",  // keep green for correct
  error:     "#e57373",  // keep red for wrong
  warn:      "#f6aa1c",  // amber for warnings
};

interface LeaderboardEntry {
  name: string;
  topScore: number;
  totalQuizzes: number;
  lastAttempt: number;
  isCurrentUser?: boolean;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
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
    <div className="flex items-center gap-3">
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
        className="text-sm font-bold w-12 text-right"
        style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
      >
        {score}%
      </span>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("quizcraft_name") || "";
    setUserName(name);

    const raw = localStorage.getItem("quizcraft_attempts");
    if (!raw) {
      setIsEmpty(true);
      setEntries([]);
      return;
    }

    try {
      const attempts: StoredAttempt[] = JSON.parse(raw);

      if (attempts.length === 0) {
        setIsEmpty(true);
        setEntries([]);
        return;
      }

      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const byName: Record<string, { topScore: number; totalQuizzes: number; lastAttempt: number }> = {};

      attempts.forEach((a) => {
        const n = a.userName || name || "You";
        if (!byName[n]) {
          byName[n] = { topScore: 0, totalQuizzes: 0, lastAttempt: 0 };
        }
        byName[n].topScore = Math.max(byName[n].topScore, Math.round((a.score / a.totalQuestions) * 100));
        byName[n].totalQuizzes += 1;
        byName[n].lastAttempt = Math.max(byName[n].lastAttempt, a.timestamp);
      });

      const realEntries: LeaderboardEntry[] = Object.entries(byName).map(([n, data]) => ({
        name: n,
        topScore: data.topScore,
        totalQuizzes: data.totalQuizzes,
        lastAttempt: data.lastAttempt,
        isCurrentUser: n === name,
      }));

      // Sort by top score desc
      realEntries.sort((a, b) => b.topScore - a.topScore);

      // Filter weekly if needed
      const filtered =
        activeTab === "weekly"
          ? realEntries.filter((e) => e.lastAttempt >= oneWeekAgo)
          : realEntries;

      setEntries(filtered);
      setIsEmpty(filtered.length === 0);
    } catch {
      setIsEmpty(true);
      setEntries([]);
    }
  }, [activeTab]);

  const hasCurrentUser = entries.some((e) => e.isCurrentUser);

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: C.bg, fontFamily: "Inter, sans-serif" }}
    >
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(240,170,28,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
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
            🏆 Leaderboard
          </h1>
        </div>

        {/* Empty state — no mock data */}
        {isEmpty && (
          <Card
            className="p-8 text-center"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.surface2}` }}
          >
            <div className="text-5xl mb-4">📋</div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
            >
              No scores yet
            </h3>
            <p className="mb-6" style={{ color: C.mutedFg }}>
              Be the first to take a quiz and claim the #1 spot!
            </p>
            <Button
              onClick={() => router.push("/")}
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

        {/* Tabs — only show if data exists */}
        {!isEmpty && (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "weekly" | "alltime")}
            >
              <TabsList
                className="grid w-full grid-cols-2"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.surface2}`,
                }}
              >
                <TabsTrigger
                  value="weekly"
                  style={{
                    fontFamily: "Lexend, sans-serif",
                    color: activeTab === "weekly" ? C.fg : C.mutedFg,
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  This Week
                </TabsTrigger>
                <TabsTrigger
                  value="alltime"
                  style={{
                    fontFamily: "Lexend, sans-serif",
                    color: activeTab === "alltime" ? C.fg : C.mutedFg,
                  }}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  All Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-3">
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;

                  return (
                    <Card
                      key={entry.name}
                      style={{
                        backgroundColor: isTop3 ? C.surface : C.surface,
                        border: entry.isCurrentUser
                          ? `2px solid ${C.primary}`
                          : `1px solid ${C.surface2}`,
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <RankMedal rank={rank} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-semibold text-base truncate"
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
                                  className="text-xs"
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
                              className="flex items-center gap-3 mt-1 text-xs"
                              style={{ color: C.mutedFg }}
                            >
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {entry.totalQuizzes} quizzes
                              </span>
                              <span>{formatDate(entry.lastAttempt)}</span>
                            </div>
                          </div>

                          <div className="w-36 hidden sm:block">
                            <ScoreBar score={entry.topScore} />
                          </div>

                          <div
                            className="sm:hidden text-sm font-bold"
                            style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                          >
                            {entry.topScore}%
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
                <CardContent className="p-4">
                  <p className="text-sm" style={{ color: C.mutedFg }}>
                    Your best score:{" "}
                    <span
                      className="font-bold"
                      style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                    >
                      {entries.find((e) => e.isCurrentUser)?.topScore ?? "—"}%
                    </span>{" "}
                    · Total quizzes taken:{" "}
                    <span
                      className="font-bold"
                      style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                    >
                      {entries.find((e) => e.isCurrentUser)?.totalQuizzes ?? 0}
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
          className="w-full"
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