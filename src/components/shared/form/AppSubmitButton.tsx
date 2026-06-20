import React from "react";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type AppSubmitButtonProps = {
  isPending: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

const AppSubmitButton = ({
  isPending,
  disabled = false,
  children,
  pendingLabel = "Submitting...",
  className,
}: AppSubmitButtonProps) => {
  const isDisabled = isPending || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      // size="lg"
      className={cn("w-full", className)}>
      {isPending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel ? pendingLabel : children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default AppSubmitButton;
