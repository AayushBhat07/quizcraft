"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  showAnswer?: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
  totalQuestions,
  showAnswer = false,
}: QuestionCardProps) {
  const options = question.options || {};

  const getOptionStyle = (key: string) => {
    const isSelected = selectedAnswer === key;
    const isCorrect = key === question.correctAnswer;

    if (showAnswer) {
      if (isCorrect) return "border-green-500 bg-green-500/10";
      if (isSelected && !isCorrect) return "border-red-500 bg-red-500/10";
    }

    return isSelected
      ? "border-primary bg-primary/10"
      : "border-input hover:border-primary/50";
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{question.topic}</Badge>
          <span className="text-sm text-muted-foreground">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xl font-medium leading-relaxed">{question.text}</p>

        <div className="space-y-3">
          {(Object.entries(options) as [string, string][]).map(([key, value]) => {
            const isSelected = selectedAnswer === key;
            const isCorrect = key === question.correctAnswer;

            return (
              <Button
                key={key}
                variant="outline"
                className={`w-full justify-start h-auto py-4 px-4 border-2 transition-all ${getOptionStyle(key)}`}
                onClick={() => !showAnswer && onSelectAnswer(key)}
                disabled={showAnswer}
              >
                <span className={`font-bold mr-3 ${isSelected ? "text-primary" : ""}`}>
                  {key}.
                </span>
                <span className="text-left">{value}</span>
                {showAnswer && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
