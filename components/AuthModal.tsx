"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const C = {
  bg:        "#1a1209",
  surface:   "#2a1a0a",
  card:      "#3d2314",
  primary:   "#f6aa1c",
  primaryFg: "#1a1209",
  muted:     "#8a7055",
  mutedFg:   "#c4a882",
  fg:        "#fff8f0",
  error:     "#e57373",
  success:   "#81c784",
};

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignedIn: (email: string) => void;
}

export default function AuthModal({ open, onClose, onSignedIn }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSignedIn(email);
      onClose();
      setEmail("");
      setPassword("");
    } catch (err: any) {
      // Friendly error messages
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Try signing in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onSignedIn("");
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm w-full"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.card}` }}
      >
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <DialogTitle
            className="text-xl"
            style={{ fontFamily: "Lexend, sans-serif", color: C.fg }}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <p className="text-sm" style={{ color: C.mutedFg }}>
            {mode === "signin"
              ? "Sign in to sync your stats across devices."
              : "Create an account to track your progress."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label
              className="block text-xs uppercase tracking-wider mb-1.5"
              style={{ color: C.mutedFg, fontFamily: "Lexend, sans-serif" }}
            >
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
              style={{
                backgroundColor: C.card,
                borderColor: C.card,
                color: C.fg,
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-wider mb-1.5"
              style={{ color: C.mutedFg, fontFamily: "Lexend, sans-serif" }}
            >
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
              style={{
                backgroundColor: C.card,
                borderColor: C.card,
                color: C.fg,
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm text-center p-2 rounded-lg"
              style={{ backgroundColor: `${C.error}22`, color: C.error }}
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base font-semibold"
            style={{
              backgroundColor: C.primary,
              color: C.primaryFg,
              fontFamily: "Lexend, sans-serif",
            }}
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="text-sm hover:underline"
            style={{ color: C.primary }}
          >
            {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>

          <div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm hover:underline"
              style={{ color: C.muted }}
            >
              Sign out
            </button>
          </div>
        </div>

        <p className="text-xs text-center mt-3" style={{ color: C.muted }}>
          Guest mode always works — Firebase is optional.
        </p>
      </DialogContent>
    </Dialog>
  );
}
