"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Send,
  Users,
  GraduationCap,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Menu,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";

export type PageKey =
  | "dashboard"
  | "create-notification"
  | "manage-teachers"
  | "manage-students"
  | "all-notifications"
  | "my-notifications"
  | "settings";

interface SidebarItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
}

function getAdminItems(): SidebarItem[] {
  return [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "create-notification", label: "Create Notification", icon: <Send className="w-4 h-4" /> },
    { key: "manage-teachers", label: "Manage Teachers", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "manage-students", label: "Manage Students", icon: <BookOpen className="w-4 h-4" /> },
    { key: "all-notifications", label: "All Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];
}

function getTeacherItems(): SidebarItem[] {
  return [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "create-notification", label: "Create Notification", icon: <Send className="w-4 h-4" /> },
    { key: "all-notifications", label: "My Notifications", icon: <Bell className="w-4 h-4" /> },
  ];
}

function getStudentItems(): SidebarItem[] {
  return [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "my-notifications", label: "My Notifications", icon: <Bell className="w-4 h-4" /> },
  ];
}

interface SidebarContentProps {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  onLogout: () => void;
  onClose?: () => void;
}

function SidebarContent({ activePage, onPageChange, onLogout, onClose }: SidebarContentProps) {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  const items =
    user.role === "ADMIN"
      ? getAdminItems()
      : user.role === "TEACHER"
        ? getTeacherItems()
        : getStudentItems();

  const getRoleIcon = () => {
    switch (user.role) {
      case "ADMIN": return <Shield className="w-4 h-4" />;
      case "TEACHER": return <GraduationCap className="w-4 h-4" />;
      case "STUDENT": return <BookOpen className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case "ADMIN": return "text-amber-500";
      case "TEACHER": return "text-blue-500";
      case "STUDENT": return "text-green-500";
    }
  };

  const handleClick = (key: PageKey) => {
    onPageChange(key);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold leading-tight truncate">Sankalp Vidya</h2>
          <p className="text-[11px] text-muted-foreground leading-tight">Notification System</p>
        </div>
      </div>

      <Separator />

      {/* User Info */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0", getRoleColor())}>
            {getRoleIcon()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.role}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activePage === item.key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Bottom Actions */}
      <div className="px-2 py-3 space-y-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          onClick={() => { onLogout(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

interface AppSidebarProps {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  onLogout: () => void;
}

export function AppSidebar({ activePage, onPageChange, onLogout }: AppSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent
          activePage={activePage}
          onPageChange={onPageChange}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg h-14 flex items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent
              activePage={activePage}
              onPageChange={onPageChange}
              onLogout={onLogout}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold">Sankalp Vidya</span>
        </div>
      </div>
    </>
  );
}
