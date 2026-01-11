"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AuthInputProps {
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  id?: string;
  name?: string;
  className?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    {
      type,
      value,
      onChange,
      placeholder,
      disabled = false,
      error,
      autoComplete,
      id,
      name,
      className,
    },
    ref
  ) {
    const shouldReduceMotion = useReducedMotion();

    return (
      <div className="w-full">
        <motion.input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          id={id}
          name={name}
          className={cn(
            "w-full",
            "bg-canvas-subtle",
            "border border-ink/10 rounded-softer",
            "px-5 py-4",
            "text-lg text-ink-secondary",
            "placeholder:text-ink-tertiary placeholder:italic",
            "focus:outline-none focus:border-ink/20 focus:shadow-soft",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-shadow duration-300",
            error && "border-ink/20",
            className
          )}
          animate={{
            opacity: disabled ? 0.5 : 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.3,
          }}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-2 text-sm text-ink-secondary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            >
              — {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default AuthInput;
