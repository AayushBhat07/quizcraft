"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Trophy, TrendingUp, Zap } from "lucide-react";

const CHAPTERS = [
  { name: "Advanced Processors and Technology", questions: 72 },
  { name: "AI and Machine Learning", questions: 74 },
  { name: "ESP32 Microcontroller", questions: 72 },
];

const SUBJECTS = [
  {
    id: "ete",
    name: "Emerging Trends in Electronics",
    icon: "🔌",
    chapters: 3,
    questions: 218,
    color: "bg-[#AC9FBB]/20 text-[#DDBDD5] border-[#AC9FBB]/30",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Alex Chen", score: 12450, avatar: "👑" },
  { rank: 2, name: "Sarah Kim", score: 11280, avatar: "🥈" },
  { rank: 3, name: "Jordan Lee", score: 10940, avatar: "🥉" },
];

export default function HomePage() {
  const [name, setName] = useState("");
  const [showChapters, setShowChapters] = useState(false);
  const router = useRouter();

  const handleStartQuiz = () => {
    if (!name.trim()) return;
    // Store name in localStorage for later use
    localStorage.setItem("quizcraft_name", name.trim());
    localStorage.setItem("quizcraft_subject", "ete");
    router.push(`/quiz?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1D1E2C" }}>
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#AC9FBB]/10 via-transparent to-[#59656F]/10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 
            className="text-5xl font-bold mb-3"
            style={{ fontFamily: "Lexend, sans-serif", color: "#F7EBEC" }}
          >
            QuizCraft
          </h1>
          <p className="text-lg" style={{ color: "#DDBDD5" }}>
            Emerging Trends in Electronics
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Name Input + Subject Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name Input */}
            <Card className="card-surface">
              <CardContent className="p-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#DDBDD5", fontFamily: "Inter, sans-serif" }}
                >
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1D1E2C] border-[#59656F] text-white text-lg h-12"
                  style={{ 
                    fontFamily: "Inter, sans-serif",
                    color: "#F7EBEC",
                    backgroundColor: "#1D1E2C",
                    borderColor: "#59656F"
                  }}
                />
              </CardContent>
            </Card>

            {/* Subject Card */}
            <div className="space-y-3">
              <h2 
                className="text-xl font-semibold"
                style={{ fontFamily: "Lexend, sans-serif", color: "#F7EBEC" }}
              >
                Choose Your Subject
              </h2>
              
              {/* ETE Subject Card */}
              <Card
                className="card-surface cursor-pointer transition-all hover:border-[#AC9FBB]/50"
                onClick={() => setShowChapters(!showChapters)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🔌</span>
                      <div>
                        <h3 
                          className="text-lg font-semibold"
                          style={{ fontFamily: "Lexend, sans-serif", color: "#F7EBEC" }}
                        >
                          Emerging Trends in Electronics
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="bg-[#AC9FBB]/20 text-[#DDBDD5] border-[#AC9FBB]/30"
                            style={{ borderColor: "rgba(172, 159, 187, 0.3)" }}
                          >
                            3 Chapters
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="bg-[#59656F]/20 text-[#DDBDD5] border-[#59656F]/30"
                            style={{ 
                              backgroundColor: "rgba(89, 101, 111, 0.2)",
                              borderColor: "rgba(89, 101, 111, 0.3)"
                            }}
                          >
                            218 Qs
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-[#AC9FBB] bg-[#AC9FBB]"
                    >
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    </div>
                  </div>

                  {/* Chapter Breakdown */}
                  {showChapters && (
                    <div className="mt-4 pt-4 border-t border-[#59656F]/30">
                      <p 
                        className="text-sm font-medium mb-2"
                        style={{ color: "#DDBDD5", fontFamily: "Inter, sans-serif" }}
                      >
                        Chapter Breakdown
                      </p>
                      <div className="space-y-2">
                        {CHAPTERS.map((chapter, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-sm"
                            style={{ color: "#DDBDD5" }}
                          >
                            <span>{chapter.name}</span>
                            <span 
                              className="font-medium"
                              style={{ color: "#AC9FBB" }}
                            >
                              {chapter.questions} Qs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Start Quiz Button */}
            <Button
              onClick={handleStartQuiz}
              disabled={!name.trim()}
              className="w-full h-14 text-lg font-semibold transition-all hover:shadow-lg disabled:opacity-40"
              style={{ 
                fontFamily: "Lexend, sans-serif",
                backgroundColor: "#AC9FBB",
                color: "#1D1E2C"
              }}
            >
              {name.trim() ? (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Quiz — Emerging Trends in Electronics
                </>
              ) : (
                "Enter your name to begin"
              )}
            </Button>
          </div>

          {/* Right: Quick Stats + Mini Leaderboard */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="card-surface">
              <CardHeader className="pb-3">
                <CardTitle 
                  className="text-lg"
                  style={{ fontFamily: "Lexend, sans-serif", color: "#F7EBEC" }}
                >
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#AC9FBB]/20">
                    <TrendingUp className="w-5 h-5" style={{ color: "#AC9FBB" }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#DDBDD5" }}>Total Quizzes</p>
                    <p className="text-xl font-bold" style={{ color: "#F7EBEC" }}>12</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#81c784]/20">
                    <Trophy className="w-5 h-5 text-[#81c784]" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#DDBDD5" }}>Avg Score</p>
                    <p className="text-xl font-bold" style={{ color: "#F7EBEC" }}>78%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#DDBDD5]/20">
                    <BookOpen className="w-5 h-5 text-[#DDBDD5]" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#DDBDD5" }}>Best Score</p>
                    <p className="text-xl font-bold" style={{ color: "#F7EBEC" }}>92%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mini Leaderboard */}
            <Card className="card-surface">
              <CardHeader className="pb-3">
                <CardTitle 
                  className="text-lg"
                  style={{ fontFamily: "Lexend, sans-serif", color: "#F7EBEC" }}
                >
                  🏆 Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LEADERBOARD.map((user) => (
                  <div key={user.rank} className="flex items-center gap-3">
                    <span className="text-xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: "#F7EBEC" }}>{user.name}</p>
                    </div>
                    <span className="font-bold" style={{ color: "#AC9FBB" }}>{user.score.toLocaleString()}</span>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-sm hover:text-white"
                  style={{ color: "#59656F" }}
                  onClick={() => router.push("/leaderboard")}
                >
                  View Full Leaderboard →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
