"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  quizzes: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  title?: string;
  maxEntries?: number;
}

export default function LeaderboardTable({
  entries,
  title = "Leaderboard",
  maxEntries = 20,
}: LeaderboardTableProps) {
  const topEntries = entries.slice(0, maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-700" />;
      default:
        return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/10 border-amber-500/30";
      case 2:
        return "bg-slate-400/10 border-slate-400/30";
      case 3:
        return "bg-orange-700/10 border-orange-700/30";
      default:
        return "bg-card";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topEntries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                entry.isCurrentUser ? "border-primary bg-primary/5" : ""
              } ${getRankBg(entry.rank)}`}
            >
              {/* Rank */}
              <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {entry.avatar || getInitials(entry.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{entry.name}</p>
                  {entry.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.quizzes} quizzes • 🔥 {entry.streak} streak
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-lg font-bold">{entry.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
