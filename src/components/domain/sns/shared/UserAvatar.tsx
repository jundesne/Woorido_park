import type { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: Pick<User, "id" | "nickname" | "profileImage" | "creditScore">;
  size?: "sm" | "md" | "lg" | "xl";
  showCreditScore?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  size = "md",
  showCreditScore = false,
  className,
}: UserAvatarProps) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar size={size}>
        <AvatarImage src={user.profileImage || undefined} alt={user.nickname} />
        <AvatarFallback>{getInitial(user.nickname)}</AvatarFallback>
      </Avatar>

      {showCreditScore && user.creditScore !== undefined && (
        <Badge
          variant={
            user.creditScore >= 800
              ? "success"
              : user.creditScore >= 600
                ? "default"
                : "warning"
          }
          className="absolute -bottom-1 -right-1 h-5 min-w-[1.25rem] px-1 text-[10px]"
        >
          {user.creditScore}
        </Badge>
      )}
    </div>
  );
}
