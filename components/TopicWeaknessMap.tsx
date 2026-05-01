"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface WeakTopic {
  topic: string;
  wrongCount: number;
  totalAttempts: number;
  percentage: number;
}

interface TopicWeaknessMapProps {
  weakTopics: WeakTopic[];
  maxTopics?: number;
}

export default function TopicWeaknessMap({
  weakTopics,
  maxTopics = 10,
}: TopicWeaknessMapProps) {
  const sortedTopics = [...weakTopics]
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, maxTopics);

  const getWeaknessColor = (percentage: number) => {
    if (percentage >= 60) return "text-red-500 bg-red-500/10 border-red-500/30";
    if (percentage >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 60) return "bg-red-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-yellow-500";
  };

  if (sortedTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-500" />
            No Weak Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Great job! You haven&apos;t mastered any weak areas yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-500" />
          Topics to Improve
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedTopics.map((topic) => (
          <div key={topic.topic} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{topic.topic}</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${getWeaknessColor(topic.percentage)}`}
                >
                  {topic.wrongCount} wrong
                </Badge>
              </div>
              <span className="text-sm font-medium">{topic.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(topic.percentage)}`}
                style={{ width: `${topic.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {topic.wrongCount} wrong out of {topic.totalAttempts} attempts
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
