"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AuthForm } from "@/components/auth";

const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const animationDuration = shouldReduceMotion ? 0 : 0.4;

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <motion.header
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationDuration, ease: EASE_SOFT }}
      >
        <h1 className="text-2xl font-serif text-ink">Welcome back</h1>
        <p className="text-sm text-ink-tertiary mt-2">
          Pick up where you left off
        </p>
      </motion.header>

      <AuthForm mode="login" />

      <motion.footer
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: animationDuration,
          delay: shouldReduceMotion ? 0 : 0.2,
          ease: EASE_SOFT,
        }}
      >
        <p className="text-sm text-ink-tertiary">
          New here?{" "}
          <Link
            href="/signup"
            className="text-ink-secondary hover:text-ink underline-offset-4 hover:underline transition-colors duration-300"
          >
            Create an account
          </Link>
        </p>
      </motion.footer>
    </div>
  );
}
