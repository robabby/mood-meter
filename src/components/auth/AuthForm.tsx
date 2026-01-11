"use client";

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";

interface AuthFormProps {
  mode: "login" | "signup";
  onSuccess?: () => void;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "That email or password doesn't match our records.",
  "User already registered": "An account with this email already exists.",
  "Unable to validate email address: invalid format": "Please enter a valid email address.",
  "Email rate limit exceeded": "Too many attempts. Please wait a moment.",
};

function getErrorMessage(error: string): string {
  const lowerError = error.toLowerCase();

  // Check for password strength errors
  if (lowerError.includes("password") && error.includes("6 characters")) {
    return "Password needs at least 6 characters.";
  }
  if (lowerError.includes("weak password")) {
    return "Password is too weak. Try something longer.";
  }
  // Check for email confirmation errors
  if (lowerError.includes("email not confirmed") || lowerError.includes("not confirmed")) {
    return "Please check your email and confirm your account first.";
  }

  return AUTH_ERROR_MESSAGES[error] || "Something went wrong. Please try again.";
}

const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        if (mode === "login") {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (authError) {
            console.error("Login error:", authError);
            setError(getErrorMessage(authError.message));
            setLoading(false);
            return;
          }
        } else {
          const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/today`,
            },
          });
          if (authError) {
            console.error("Signup error:", authError);
            setError(getErrorMessage(authError.message));
            setLoading(false);
            return;
          }
          // Signup successful - show confirmation message
          setSignupComplete(true);
          setLoading(false);
          onSuccess?.();
          return;
        }

        // Login successful - redirect
        onSuccess?.();
        router.push("/today");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    },
    [mode, email, password, supabase, router, onSuccess]
  );

  const animationDuration = shouldReduceMotion ? 0 : 0.4;

  // Show success message after signup
  if (signupComplete) {
    return (
      <motion.div
        className="w-full flex flex-col gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationDuration, ease: EASE_SOFT }}
      >
        <p className="text-lg text-ink-secondary">
          Check your email
        </p>
        <p className="text-sm text-ink-tertiary">
          We sent a confirmation link to <span className="text-ink-secondary">{email}</span>.
          Click the link to finish setting up your account.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationDuration, ease: EASE_SOFT }}
    >
      <AuthInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="Email"
        disabled={loading}
        autoComplete="email"
        id="email"
        name="email"
      />

      <AuthInput
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Password"
        disabled={loading}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        id="password"
        name="password"
      />

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-ink-secondary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          >
            — {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AuthButton type="submit" loading={loading} disabled={!email || !password}>
        {loading
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </AuthButton>
    </motion.form>
  );
}

export default AuthForm;
