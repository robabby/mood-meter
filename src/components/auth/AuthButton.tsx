"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function AuthButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className,
}: AuthButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full",
        "px-6 py-3",
        "text-base",
        "rounded-full",
        "border border-ink/10 hover:border-ink/20",
        "text-ink-secondary hover:text-ink",
        "transition-colors duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-ink/10 disabled:hover:text-ink-secondary",
        className
      )}
      animate={{
        opacity: isDisabled ? 0.7 : 1,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
      }}
    >
      {children}
    </motion.button>
  );
}

export default AuthButton;
