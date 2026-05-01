"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface ScoreBreakdownItem {
  chapterId: string;
  chapterName: string;
  score: number;
  total: number;
  topicBreakdown?: {
    topic: string;
    correct: number;
    total: number;
  }[];
}

interface ScoreBreakdownProps {
  items: ScoreBreakdownItem[];
  title?: string;
}

export default function ScoreBreakdown({
  items,
  title = "Score Breakdown",
}: ScoreBreakdownProps) {
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  const totalQuestions = items.reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="p-3 rounded-full bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className="text-2xl font-bold">
              {totalScore}/{totalQuestions} ({overallPercentage}%)
            </p>
          </div>
          <Progress value={overallPercentage} className="w-24" />
        </div>

        {/* Per-Chapter Breakdown */}
        <div className="space-y-4">
          {items.map((item) => {
            const percentage = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
            const isPassing = percentage >= 70;

            return (
              <div key={item.chapterId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.chapterName}</span>
                    <Badge variant={isPassing ? "default" : "destructive"} className="text-xs">
                      {item.score}/{item.total}
                    </Badge>
                  </div>
                  <span className={`text-sm font-medium ${isPassing ? "text-green-500" : "text-red-500"}`}>
                    {percentage}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />

                {/* Topic Breakdown */}
                {item.topicBreakdown && item.topicBreakdown.length > 0 && (
                  <div className="pl-4 space-y-2 border-l-2 border-muted">
                    {item.topicBreakdown.map((topic) => {
                      const topicPct = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
                      return (
                        <div key={topic.topic} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{topic.topic}</span>
                          <div className="flex items-center gap-2">
                            {topic.correct === topic.total ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : topic.correct === 0 ? (
                              <XCircle className="w-3 h-3 text-red-500" />
                            ) : null}
                            <span className="text-muted-foreground">
                              {topic.correct}/{topic.total}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
