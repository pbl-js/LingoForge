import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
type BackButtonProps = {
  onClick: () => void;
  className?: string;
};

export const BackButton = ({ onClick, className }: BackButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full border-4 border-purple-800/50 text-white transition-colors hover:border-transparent hover:bg-purple-800/50 hover:text-white",
        className
      )}
      onClick={onClick}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
};
