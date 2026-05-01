"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";

interface ProgressDataPoint {
  date: string;
  score: number;
  label?: string;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
  height?: number;
}

export default function ProgressChart({
  data,
  title = "Your Progress",
  height = 200,
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            No progress data yet. Take some quizzes to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxScore = Math.max(...data.map((d) => d.score), 100);
  const minScore = Math.min(...data.map((d) => d.score), 0);
  const range = maxScore - minScore || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - ((d.score - minScore) / range) * 100,
    data: d,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  const areaD = `${pathD} L 100,100 L 0,100 Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="2,2"
              />
            ))}

            {/* Area fill */}
            <path
              d={areaD}
              fill="url(#progressGradient)"
              stroke="none"
              opacity="0.3"
            />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-muted-foreground pointer-events-none" style={{ width: "2rem" }}>
            <span>{maxScore}%</span>
            <span>{minScore}%</span>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {data.length > 0 && (
            <>
              <span>{data[0].label || data[0].date}</span>
              {data.length > 1 && (
                <span>{data[data.length - 1].label || data[data.length - 1].date}</span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
