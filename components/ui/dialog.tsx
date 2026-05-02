"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({ children, className = "", style }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      />
      <DialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] ${className}`}
        style={{ backgroundColor: "#2a1a0a", borderColor: "#3d2314", ...style }}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "#c4a882" }}
        >
          <X className="w-4 h-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return <div className={`mb-4 text-center ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "", style }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title className={`text-xl font-semibold ${className}`} style={{ color: "#fff8f0", fontFamily: "Lexend, sans-serif", ...style }}>
      {children}
    </DialogPrimitive.Title>
  );
}
