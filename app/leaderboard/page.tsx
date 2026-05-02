"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  Loader2,
  CloudOff,
} from "lucide-react";
import type { StoredAttempt } from "@/lib/quizData";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/firebaseHelpers";

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
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("quizcraft_name") || "";
    setUserName(name);

    // Load local entries
    const raw = localStorage.getItem("quizcraft_attempts");
    if (raw) {
      try {
        const attempts: StoredAttempt[] = JSON.parse(raw);
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const byName: Record<string, { topScore: number; totalQuizzes: number; lastAttempt: number }> = {};
        attempts.forEach((a) => {
          const n = a.userName || name || "You";
          if (!byName[n]) byName[n] = { topScore: 0, totalQuizzes: 0, lastAttempt: 0 };
          byName[n].topScore = Math.max(byName[n].topScore, Math.round((a.score / a.totalQuestions) * 100));
          byName[n].totalQuizzes += 1;
          byName[n].lastAttempt = Math.max(byName[n].lastAttempt, a.timestamp);
        });

        const realEntries: LeaderboardEntry[] = Object.entries(byName).map(([n, data]) => ({
          odId: n,
          userName: n,
          topScore: data.topScore,
          totalQuizzes: data.totalQuizzes,
          lastAttempt: data.lastAttempt,
          isCurrentUser: n === name,
        }));

        realEntries.sort((a, b) => b.topScore - a.topScore);

        const filtered =
          activeTab === "weekly"
            ? realEntries.filter((e) => e.lastAttempt >= oneWeekAgo)
            : realEntries;

        setLocalEntries(filtered);
      } catch {
        setLocalEntries([]);
      }
    }
  }, [activeTab]);

  // Load Firestore leaderboard when tab changes
  useEffect(() => {
    if (!firebaseUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getLeaderboard(20)
      .then((fsEntries) => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const filtered =
          activeTab === "weekly"
            ? fsEntries.filter((e) => e.lastAttempt >= oneWeekAgo)
            : fsEntries;

        // Add isCurrentUser flag
        const withCurrentUser = filtered.map((e) => ({
          ...e,
          isCurrentUser: e.odId === firebaseUser.uid,
        }));

        setEntries(withCurrentUser);
        setIsEmpty(withCurrentUser.length === 0);
      })
      .catch(() => {
        setEntries([]);
        setIsEmpty(true);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab, firebaseUser]);

  const displayEntries = firebaseUser ? entries : localEntries;
  const isEmptyFinal = firebaseUser ? isEmpty : localEntries.length === 0;
  const hasCurrentUser = displayEntries.some((e) => (e as any).isCurrentUser);

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

        {/* Firestore indicator */}
        {firebaseUser && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit"
            style={{ backgroundColor: `${C.success}22`, color: C.success }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.success }} />
            Synced from Firestore
          </div>
        )}

        {/* Empty state */}
        {isEmptyFinal && !isLoading && (
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
              {firebaseUser
                ? "Be the first to take a quiz and claim the #1 spot!"
                : "Sign in to join the global leaderboard and see scores from all devices."}
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

        {/* Loading */}
        {isLoading && firebaseUser && (
          <div className="flex items-center justify-center py-12 gap-3" style={{ color: C.mutedFg }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading global leaderboard...</span>
          </div>
        )}

        {/* Tabs */}
        {!isEmptyFinal && !isLoading && (
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
              {displayEntries.map((entry, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const e = entry as any;

                return (
                  <Card
                    key={e.odId || e.userName}
                    style={{
                      backgroundColor: C.surface,
                      border: e.isCurrentUser
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
                                color: e.isCurrentUser ? C.primary : C.fg,
                              }}
                            >
                              {e.userName}
                            </span>
                            {e.isCurrentUser && (
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
                              {e.totalQuizzes} quizzes
                            </span>
                            <span>{formatDate(e.lastAttempt)}</span>
                          </div>
                        </div>

                        <div className="w-36 hidden sm:block">
                          <ScoreBar score={e.topScore} />
                        </div>

                        <div
                          className="sm:hidden text-sm font-bold"
                          style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                        >
                          {e.topScore}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}

        {/* Your rank summary */}
        {hasCurrentUser && !isLoading && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.surface2}` }}>
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: C.mutedFg }}>
                Your best score:{" "}
                <span
                  className="font-bold"
                  style={{ fontFamily: "Lexend, sans-serif", color: C.primary }}
                >
                  {displayEntries.find((e: any) => e.isCurrentUser)?.topScore ?? "—"}%
                </span>{" "}
                · Total quizzes taken:{" "}
                <span
                  className="font-bold"
                  style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
                >
                  {displayEntries.find((e: any) => e.isCurrentUser)?.totalQuizzes ?? 0}
                </span>
              </p>
            </CardContent>
          </Card>
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
