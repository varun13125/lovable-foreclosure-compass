
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart2, 
  Briefcase, 
  Calendar, 
  FileText, 
  Home, 
  MessageSquare,
  Settings, 
  Users,
  Shield,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav className={cn("space-y-1", className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2.5 text-sm font-medium rounded-md",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0")} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  
  useEffect(() => {
    // Set user display name from auth state
    if (authState.user) {
      if (authState.user.firstName || authState.user.lastName) {
        const displayName = [authState.user.firstName, authState.user.lastName]
          .filter(Boolean)
          .join(' ');
        setUserName(displayName || authState.user.email || 'User');
      } else if (authState.user.email) {
        setUserName(authState.user.email);
      }
    }
  }, [authState.user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Cases",
      href: "/cases",
      icon: Briefcase,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    }
  ];
  
  // Add admin link for system_admin users
  if (authState.user?.role === 'system_admin') {
    sidebarNavItems.push({
      title: "Administration",
      href: "/admin",
      icon: Shield,
    });
  }

  // Generate user initials safely with null checks
  const getUserInitials = () => {
    if (!userName) return 'U';
    
    const nameParts = userName.split(' ').filter(Boolean);
    if (nameParts.length === 0) return 'U';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar fixed inset-y-0">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl text-sidebar-foreground">
          <span className="h-6 w-6 rounded bg-law-teal flex items-center justify-center text-white font-bold">F</span>
          <span>ForeLaw</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4 px-4">
        <SidebarNav items={sidebarNavItems} />
      </div>
      <div className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-md transition-colors">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sidebar-foreground font-semibold">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm text-sidebar-foreground">{userName}</span>
                <span className="text-xs text-sidebar-foreground/60">
                  {authState.user?.role ? (authState.user.role === 'system_admin' 
                    ? 'System Administrator' 
                    : authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1))
                    : 'User'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
