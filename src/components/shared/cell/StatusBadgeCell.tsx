import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/doctor.types";

interface StatusBadgeCellProps {
  status: UserStatus;
}

const StatusBadgeCell = ({ status }: StatusBadgeCellProps) => {
  return (
    <Badge
      variant={
        status === UserStatus.ACTIVE
          ? "success"
          : status === UserStatus.BLOCKED
            ? "destructive"
            : "secondary"
      }>
      <span className="text-sm capitalize">{status.toLowerCase()}</span>
    </Badge>
  );
};

export default StatusBadgeCell;
