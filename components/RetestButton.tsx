"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Lightbulb } from "lucide-react";

interface RetestButtonProps {
  topicName: string;
  questionCount: number;
  onStartRetest: () => void;
  disabled?: boolean;
}

export default function RetestButton({
  topicName,
  questionCount,
  onStartRetest,
  disabled = false,
}: RetestButtonProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Lightbulb className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Retest: {topicName}</p>
          <p className="text-xs text-muted-foreground">
            {questionCount} questions based on your weak areas
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onStartRetest}
        disabled={disabled}
        className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Start Retest
      </Button>
    </div>
  );
}
