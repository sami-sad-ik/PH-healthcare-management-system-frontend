import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfoCellProps {
  name: string;
  email: string;
  profilePhoto?: string;
}

const UserInfoCell = ({ name, email, profilePhoto }: UserInfoCellProps) => {
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-10 w-10">
        <AvatarImage src={profilePhoto || undefined} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
};

export default UserInfoCell;
