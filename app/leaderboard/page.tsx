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

// Mock placeholder users
const MOCK_USERS = [
  { name: "Rahul V.", score: 94, quizzes: 8, lastDate: 1747563000000 },
  { name: "Priya S.", score: 91, quizzes: 12, lastDate: 1747646400000 },
  { name: "Ankit M.", score: 87, quizzes: 6, lastDate: 1747559400000 },
  { name: "Sneha K.", score: 82, quizzes: 9, lastDate: 1747632000000 },
  { name: "Vikram R.", score: 78, quizzes: 5, lastDate: 1747531200000 },
];

interface AttemptEntry {
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
        backgroundColor: C.surface,
        color: C.muted,
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
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.surface }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? C.success : score >= 60 ? C.accent : C.error,
          }}
        />
      </div>
      <span
        className="text-sm font-bold w-12 text-right"
        style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
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
  const [isEmpty, setIsEmpty] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("quizcraft_name") || "";
    setUserName(name);

    const raw = localStorage.getItem("quizcraft_attempts");
    if (!raw) {
      setIsEmpty(true);
      setEntries(
        MOCK_USERS.map((u) => ({
          name: u.name,
          topScore: u.score,
          totalQuizzes: u.quizzes,
          lastAttempt: u.lastDate,
        }))
      );
      return;
    }

    try {
      const attempts: AttemptEntry[] = JSON.parse(raw);

      if (attempts.length === 0) {
        setIsEmpty(true);
        setEntries(
          MOCK_USERS.map((u) => ({
            name: u.name,
            topScore: u.score,
            totalQuizzes: u.quizzes,
            lastAttempt: u.lastDate,
          }))
        );
        return;
      }

      // Week boundaries
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Aggregate by name
      const byName: Record<
        string,
        { topScore: number; totalQuizzes: number; lastAttempt: number }
      > = {};

      attempts.forEach((a) => {
        const n = name || "You";
        if (!byName[n]) {
          byName[n] = { topScore: 0, totalQuizzes: 0, lastAttempt: 0 };
        }
        byName[n].topScore = Math.max(byName[n].topScore, a.percentage);
        byName[n].totalQuizzes += 1;
        byName[n].lastAttempt = Math.max(byName[n].lastAttempt, a.date);
      });

      // Build real entries
      const realEntries: LeaderboardEntry[] = Object.entries(byName).map(
        ([n, data]) => ({
          name: n,
          topScore: data.topScore,
          totalQuizzes: data.totalQuizzes,
          lastAttempt: data.lastAttempt,
          isCurrentUser: n === name,
        })
      );

      // Add mock users
      const mockEntries: LeaderboardEntry[] = MOCK_USERS.map((u) => ({
        name: u.name,
        topScore: u.score,
        totalQuizzes: u.quizzes,
        lastAttempt: u.lastDate,
      }));

      const allEntries = [...realEntries, ...mockEntries];

      // Filter weekly if needed
      const filtered =
        activeTab === "weekly"
          ? allEntries.filter((e) => e.lastAttempt >= oneWeekAgo)
          : allEntries;

      // Sort by top score desc
      filtered.sort((a, b) => b.topScore - a.topScore);

      setEntries(filtered);
    } catch {
      setIsEmpty(true);
      setEntries(
        MOCK_USERS.map((u) => ({
          name: u.name,
          topScore: u.score,
          totalQuizzes: u.quizzes,
          lastAttempt: u.lastDate,
        }))
      );
    }
  }, [activeTab]);

  const hasCurrentUser = entries.some((e) => e.isCurrentUser);

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
            🏆 Leaderboard
          </h1>
        </div>

        {/* Empty state message */}
        {isEmpty && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{ backgroundColor: `${C.accent}22`, color: C.accent }}
          >
            <Trophy className="w-4 h-4" />
            Be the first to take a quiz!
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "weekly" | "alltime")}
        >
          <TabsList
            className="grid w-full grid-cols-2"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.secondary}`,
            }}
          >
            <TabsTrigger
              value="weekly"
              style={{
                fontFamily: "Lexend, sans-serif",
                color: activeTab === "weekly" ? C.light : C.muted,
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              style={{
                fontFamily: "Lexend, sans-serif",
                color: activeTab === "alltime" ? C.light : C.muted,
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {entries.length === 0 ? (
              <Card
                className="p-8 text-center"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}
              >
                <div className="text-4xl mb-3">📊</div>
                <p style={{ color: C.muted }}>
                  No activity this week. Take a quiz to get on the board!
                </p>
              </Card>
            ) : (
              entries.map((entry, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;

                return (
                  <Card
                    key={entry.name}
                    style={{
                      backgroundColor: isTop3 ? `${C.surface}` : C.surface,
                      border: entry.isCurrentUser
                        ? `2px solid ${C.accent}`
                        : `1px solid ${C.secondary}`,
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <RankMedal rank={rank} />

                        {/* Name + badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-semibold text-base truncate"
                              style={{
                                fontFamily: "Lexend, sans-serif",
                                color: entry.isCurrentUser ? C.accent : C.light,
                              }}
                            >
                              {entry.name}
                            </span>
                            {entry.isCurrentUser && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: C.accent,
                                  color: C.accent,
                                }}
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-3 mt-1 text-xs"
                            style={{ color: C.muted }}
                          >
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {entry.totalQuizzes} quizzes
                            </span>
                            <span>{formatDate(entry.lastAttempt)}</span>
                          </div>
                        </div>

                        {/* Score bar */}
                        <div className="w-36 hidden sm:block">
                          <ScoreBar score={entry.topScore} />
                        </div>

                        {/* Score badge for mobile */}
                        <div
                          className="sm:hidden text-sm font-bold"
                          style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
                        >
                          {entry.topScore}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Stats summary */}
        {userName && (
          <Card style={{ backgroundColor: C.surface, border: `1px solid ${C.secondary}` }}>
            <CardContent className="p-4">
              <p className="text-sm" style={{ color: C.muted }}>
                Your best score:{" "}
                <span
                  className="font-bold"
                  style={{ fontFamily: "Lexend, sans-serif", color: C.accent }}
                >
                  {entries.find((e) => e.isCurrentUser)?.topScore ?? "—"}%
                </span>{" "}
                · Total quizzes taken:{" "}
                <span
                  className="font-bold"
                  style={{ fontFamily: "Lexend, sans-serif", color: C.light }}
                >
                  {entries.find((e) => e.isCurrentUser)?.totalQuizzes ?? 0}
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Take quiz CTA */}
        <Button
          onClick={() => router.push("/")}
          className="w-full"
          style={{
            backgroundColor: C.accent,
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