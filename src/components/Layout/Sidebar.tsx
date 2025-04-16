
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart2, 
  Briefcase, 
  Calendar, 
  FileText, 
  Home, 
  MessageSquare,
  Settings, 
  Users 
} from "lucide-react";

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
  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/",
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
    },
  ];

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
        <div className="flex items-center gap-3 p-2">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold">JL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-sidebar-foreground">Jennifer Lee</span>
            <span className="text-xs text-sidebar-foreground/60">Associate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
