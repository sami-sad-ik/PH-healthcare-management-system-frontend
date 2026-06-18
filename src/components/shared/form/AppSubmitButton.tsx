import { Button } from "@base-ui/react";
import React from "react";

type AppSubmitButtonProps = {
  isPending: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

const AppSubmitButton = () => {
  return <Button></Button>;
};

export default AppSubmitButton;
