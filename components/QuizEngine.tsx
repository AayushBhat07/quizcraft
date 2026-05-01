"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Question } from "@/types";
import QuestionCard from "./QuestionCard";

interface QuizEngineProps {
  questions: Question[];
  subjectId: string;
  onComplete: (results: QuizResults) => void;
  timeLimit?: number; // seconds
}

export interface QuizResults {
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  wrongQuestionIds: string[];
  weakTopics: string[];
  timestamp: number;
}

export default function QuizEngine({
  questions,
  subjectId,
  onComplete,
  timeLimit = 600,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const selectedAnswer = answers[currentQuestion?.id];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleFinish = useCallback(() => {
    const wrongQuestionIds: string[] = [];
    const weakTopicsSet = new Set<string>();

    questions.forEach((q) => {
      if (answers[q.id] !== q.correctAnswer) {
        wrongQuestionIds.push(q.id);
        weakTopicsSet.add(q.topic);
      }
    });

    const score = questions.length - wrongQuestionIds.length;
    const results: QuizResults = {
      score,
      totalQuestions: questions.length,
      answers,
      wrongQuestionIds,
      weakTopics: Array.from(weakTopicsSet),
      timestamp: Date.now(),
    };

    setShowResult(true);
    onComplete(results);
  }, [questions, answers, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeCritical = timeLeft < 60;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant={isTimeCritical ? "destructive" : "outline"}>
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="secondary">
              <Trophy className="w-4 h-4 mr-1" />
              {Object.keys(answers).length}/{questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="flex-1"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Finish Quiz
                <Trophy className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Question Navigator Dots */}
        <div className="flex flex-wrap justify-center gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            const isWrong = isAnswered && answers[q.id] !== q.correctAnswer;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center
                  ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                  ${isWrong ? "bg-red-500/20 text-red-500" : isAnswered ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
