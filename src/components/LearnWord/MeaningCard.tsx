import { darkenRgbColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

export function MeaningCard({
  index,
  length,
  onDragEnd,
  children,
}: {
  index: number;
  length: number;
  onDragEnd: () => void;
  children: React.ReactNode;
}) {
  console.log('index', index);
  console.log('length', length);
  return (
    <motion.div
      drag="y"
      onDragEnd={onDragEnd}
      initial={{
        backgroundColor: darkenRgbColor(
          `rgba(126,34,206)`,
          (length - 1 - index) * 10
        ),
        shadow: `0px 0px 10px 0px rgba(126,34,206)`,
        scale: 1 - (length - 1 - index) * 0.05,
        top: (length - 1 - index) * 20,
      }}
      animate={{
        shadow: `0px 0px 10px 0px rgba(126,34,206)`,
        scale: 1 - (length - 1 - index) * 0.05,
        top: (length - 1 - index) * 20,
        backgroundColor: darkenRgbColor(
          `rgba(126,34,206)`,
          (length - 1 - index) * 10
        ),
      }}
      dragConstraints={{
        top: 0,
        bottom: 0,
      }}
      className="flex flex-col rounded-2xl h-[80%]  absolute top-0 left-0 w-full shadow-xl"
    >
      {children}
    </motion.div>
  );
}
