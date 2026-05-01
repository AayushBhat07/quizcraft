"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronRight, CheckCircle } from "lucide-react";
import { Subject, Chapter } from "@/types";

interface ChapterSelectorProps {
  subjects: Subject[];
  onSelectChapter: (subjectId: string, chapterId: string) => void;
  onSelectSubject: (subjectId: string) => void;
  completedChapterIds?: string[];
}

export default function ChapterSelector({
  subjects,
  onSelectChapter,
  onSelectSubject,
  completedChapterIds = [],
}: ChapterSelectorProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-4">
      {/* Subject Tabs */}
      <Tabs
        value={selectedSubjectId || ""}
        onValueChange={(val) => {
          setSelectedSubjectId(val);
          onSelectSubject(val);
        }}
      >
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          {subjects.map((subject) => (
            <TabsTrigger
              key={subject.id}
              value={subject.id}
              className="flex items-center gap-2 px-3 py-2"
            >
              <span>{getSubjectIcon(subject.id)}</span>
              <span className="hidden sm:inline">{subject.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Chapter List */}
      {selectedSubject ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{selectedSubject.name} Chapters</h3>
            <Badge variant="secondary">
              {completedChapterIds.filter((id) =>
                selectedSubject.chapters.some((c) => c.id === id)
              ).length}
              /{selectedSubject.chapters.length} completed
            </Badge>
          </div>

          <div className="grid gap-3">
            {selectedSubject.chapters.map((chapter) => {
              const isCompleted = completedChapterIds.includes(chapter.id);
              const questionCount = chapter.questions.length;

              return (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer hover:border-primary/50 transition-all ${
                    isCompleted ? "border-green-500/30 bg-green-500/5" : ""
                  }`}
                  onClick={() => onSelectChapter(selectedSubject.id, chapter.id)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isCompleted ? "bg-green-500/10" : "bg-muted"}`}>
                        <BookOpen className={`w-5 h-5 ${isCompleted ? "text-green-500" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{chapter.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {questionCount} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a subject to view chapters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getSubjectIcon(subjectId: string): string {
  const icons: Record<string, string> = {
    physics: "⚛️",
    chemistry: "🧪",
    mathematics: "📐",
    biology: "🧬",
  };
  return icons[subjectId] || "📚";
}
