"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Placeholder quiz data
const PLACEHOLDER_QUESTIONS = [
  {
    id: "q1",
    text: "What is the SI unit of force?",
    options: { A: "Joule", B: "Newton", C: "Watt", D: "Pascal" },
    correctAnswer: "B",
    topic: "Kinematics",
  },
  {
    id: "q2",
    text: "Which law states that for every action, there is an equal and opposite reaction?",
    options: { A: "First Law", B: "Second Law", C: "Third Law", D: "Law of Gravitation" },
    correctAnswer: "C",
    topic: "Laws of Motion",
  },
  {
    id: "q3",
    text: "The acceleration due to gravity on Earth is approximately:",
    options: { A: "8.8 m/s²", B: "9.8 m/s²", C: "10.8 m/s²", D: "11.8 m/s²" },
    correctAnswer: "B",
    topic: "Gravitation",
  },
  {
    id: "q4",
    text: "Which of the following is a scalar quantity?",
    options: { A: "Velocity", B: "Acceleration", C: "Force", D: "Mass" },
    correctAnswer: "D",
    topic: "Kinematics",
  },
  {
    id: "q5",
    text: "Momentum is defined as:",
    options: { A: "Force × Time", B: "Mass × Velocity", C: "Mass × Acceleration", D: "Force × Distance" },
    correctAnswer: "B",
    topic: "Laws of Motion",
  },
];

export default function QuizPage() {
  const params = useParams();
  const subject = params.subject as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const question = PLACEHOLDER_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PLACEHOLDER_QUESTIONS.length) * 100;
  const score = Object.entries(answers).filter(
    ([qId, ans]) => PLACEHOLDER_QUESTIONS.find((q) => q.id === qId)?.correctAnswer === ans
  ).length;

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (currentQuestion < PLACEHOLDER_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    // Calculate results
    const score = Object.entries(answers).filter(
      ([qId, ans]) => PLACEHOLDER_QUESTIONS.find((q) => q.id === qId)?.correctAnswer === ans
    ).length;
    const total = PLACEHOLDER_QUESTIONS.length;
    const percentage = Math.round((score / total) * 100);
    const timeTaken = 300 - timeLeft;
    const wrongQuestionIds = PLACEHOLDER_QUESTIONS
      .filter((q) => answers[q.id] && answers[q.id] !== q.correctAnswer)
      .map((q) => q.id);

    // Compute chapter breakdown
    const chapters: Record<string, { correct: number; total: number }> = {};
    PLACEHOLDER_QUESTIONS.forEach((q) => {
      if (!chapters[q.chapterName]) chapters[q.chapterName] = { correct: 0, total: 0 };
      chapters[q.chapterName].total++;
      if (answers[q.id] === q.correctAnswer) chapters[q.chapterName].correct++;
    });

    // Weak topics: topics with < 70% correct
    const topicStats: Record<string, { correct: number; total: number }> = {};
    PLACEHOLDER_QUESTIONS.forEach((q) => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
      topicStats[q.topic].total++;
      if (answers[q.id] === q.correctAnswer) topicStats[q.topic].correct++;
    });
    const weakTopics = Object.entries(topicStats)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.7)
      .map(([t]) => t);

    const attemptData = {
      id: `attempt-${Date.now()}`,
      date: Date.now(),
      score,
      total,
      percentage,
      timeTaken,
      chapters,
      weakTopics,
      wrongQuestionIds,
    };

    // Store answers for wrong question review
    localStorage.setItem("quizcraft_answers", JSON.stringify(answers));

    // Save to attempts history
    const existingRaw = localStorage.getItem("quizcraft_attempts");
    const existing: typeof attemptData[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(attemptData);
    localStorage.setItem("quizcraft_attempts", JSON.stringify(existing));

    // Set last attempt for results page
    localStorage.setItem("quizcraft_last_attempt", JSON.stringify(attemptData));

    router.push(`/results/attempt-${Date.now()}`);
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="text-center">
            <CardHeader>
              <div className="text-6xl mb-4">⚛️</div>
              <CardTitle className="text-3xl capitalize">{subject} Quiz</CardTitle>
              <p className="text-muted-foreground mt-2">
                Test your knowledge with {PLACEHOLDER_QUESTIONS.length} questions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Questions</span>
                  </div>
                  <p className="text-2xl font-bold">{PLACEHOLDER_QUESTIONS.length}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="text-2xl font-bold">5:00</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Passing</span>
                  </div>
                  <p className="text-2xl font-bold">70%</p>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => setQuizStarted(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center">
            <CardHeader>
              <div className="text-6xl mb-4">
                {score >= 4 ? "🎉" : score >= 3 ? "👍" : "📚"}
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <p className="text-muted-foreground">
                You scored {score} out of {PLACEHOLDER_QUESTIONS.length}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-8 py-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">{score}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-500">
                    {PLACEHOLDER_QUESTIONS.length - score}
                  </p>
                  <p className="text-sm text-muted-foreground">Wrong</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
                  Go Home
                </Button>
                <Button className="flex-1" onClick={handleFinish}>
                  View Results
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answers Review */}
          <Card>
            <CardHeader>
              <CardTitle>Answers Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PLACEHOLDER_QUESTIONS.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        Q{idx + 1}: {q.text}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {Object.entries(q.options || {}).map(([key, val]) => (
                          <Badge
                            key={key}
                            variant={
                              key === q.correctAnswer
                                ? "default"
                                : key === userAnswer && !isCorrect
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {key}. {val}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setQuizStarted(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="font-medium capitalize">{subject} Quiz</p>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {PLACEHOLDER_QUESTIONS.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-amber-500">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{question.topic}</Badge>
              <Badge variant="outline">
                Score: {score}/{currentQuestion}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl font-medium">{question.text}</p>

            <div className="space-y-3">
              {Object.entries(question.options || {}).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedAnswer === key ? "default" : "outline"}
                  className="w-full justify-start h-auto py-4 px-4"
                  onClick={() => handleSelectAnswer(key)}
                >
                  <span className="font-bold mr-3">{key}.</span>
                  <span>{value}</span>
                </Button>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!selectedAnswer}
              onClick={handleNext}
            >
              {currentQuestion < PLACEHOLDER_QUESTIONS.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Finish Quiz
                  <Trophy className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2">
          {PLACEHOLDER_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentQuestion(idx);
                setSelectedAnswer(answers[q.id] || null);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentQuestion
                  ? "bg-primary"
                  : answers[q.id]
                  ? "bg-green-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
