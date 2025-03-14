"use client";

import React from "react";
import { motion, Variants, HTMLMotionProps } from "framer-motion";

interface WavyTextProps extends HTMLMotionProps<"div"> {
  text: string;
  delay?: number;
  isAnimating: boolean;
  duration?: number;
  className?: string;
}

export const WavyText: React.FC<WavyTextProps> = ({
  text,
  delay = 0,
  duration = 0.05,
  isAnimating,
  className = "",
  ...props
}: WavyTextProps) => {
  const letters = Array.from(text);

  const container: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: duration, delayChildren: i * delay },
    }),
    exit: (i: number = 1) => ({
      opacity: 0,
      transition: {
        staggerChildren: duration,
        staggerDirection: -1,
        delayChildren: i * delay,
      },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isAnimating ? "visible" : "hidden"}
      exit="exit"
      {...props}
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};
