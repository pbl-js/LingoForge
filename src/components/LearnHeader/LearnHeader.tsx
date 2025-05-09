"use client";
import React from "react";
import { BackButton } from "../BackButton/BackButton";

type LearnHeaderProps = {
  onBack?: () => void;
};

export const LearnHeader = ({ onBack = () => window.history.back() }: LearnHeaderProps) => {
  return (
    <div>
      <BackButton onClick={onBack} />
    </div>
  );
};
