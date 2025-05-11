import React from "react";
import { CreateGameDataSetModal } from "@/components/CreateGameDataSetModal/CreateGameDataSetModal";
export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Topics</h1>
      <CreateGameDataSetModal />
    </div>
  );
}
