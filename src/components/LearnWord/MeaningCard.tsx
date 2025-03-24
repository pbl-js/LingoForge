import { cn, darkenRgbColor } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export function MeaningCard({
  index,
  length,
  onDragEnd,
  renderBack,
  renderFront,
  className,
}: {
  index: number;
  length: number;
  onDragEnd: () => void;
  renderFront: React.ReactNode;
  renderBack: React.ReactNode;
  className?: string;
}) {
  console.log("index", index);
  console.log("length", length);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const [animationVariant, setAnimationVariant] = React.useState<"stack" | "flip">("stack");
  function toggleFlipped() {
    setIsFlipped(!isFlipped);
  }

  const flippingAnimationTime = 0.3;

  const handleClick = () => {
    if (!isDragging) {
      setAnimationVariant("flip");
      toggleFlipped();
      setTimeout(() => {
        setAnimationVariant("stack");
      }, flippingAnimationTime * 1000);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <motion.div
      drag="y"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      initial={{
        backgroundColor: darkenRgbColor(`rgba(126,34,206)`, (length - 1 - index) * 10),
        shadow: `0px 0px 10px 0px rgba(126,34,206)`,
        scale: 1 - (length - 1 - index) * 0.05,
        top: (length - 1 - index) * 20,
      }}
      animate={
        animationVariant === "stack"
          ? {
              shadow: `0px 0px 10px 0px rgba(126,34,206)`,
              scale: 1 - (length - 1 - index) * 0.05,
              top: (length - 1 - index) * 20,
              backgroundColor: darkenRgbColor(`rgba(126,34,206)`, (length - 1 - index) * 10),
              rotateY: isFlipped ? 180 : 0,
            }
          : {
              rotateY: isFlipped ? 180 : 0,
              transition: { duration: flippingAnimationTime },
            }
      }
      dragConstraints={{
        top: 0,
        bottom: 0,
      }}
      className={cn(
        "absolute left-0 top-0 flex h-[80%] w-full flex-col rounded-2xl shadow-xl",
        className
      )}
    >
      {isFlipped ? renderBack : renderFront}
    </motion.div>
  );
}
