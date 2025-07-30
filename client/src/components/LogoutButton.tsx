import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = "ghost", 
  size = "sm", 
  className = "", 
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const { logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Redirect to home page after successful logout
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout fails to avoid stuck state
      setLocation("/");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      disabled={logoutMutation.isPending}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {children || (logoutMutation.isPending ? "Logging out..." : "Logout")}
    </Button>
  );
}