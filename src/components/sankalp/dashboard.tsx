"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Moon,
  Sun,
  Users,
  Send,
  Bell,
  GraduationCap,
  BookOpen,
  Shield,
  ChevronDown,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/auth-store";
import { UserManagement } from "./user-management";
import { NotificationForm } from "./notification-form";
import { NotificationList } from "./notification-list";

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) return null;

  const handleNotificationSent = () => {
    setRefreshKey((k) => k + 1);
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "ADMIN": return <Shield className="w-5 h-5" />;
      case "TEACHER": return <GraduationCap className="w-5 h-5" />;
      case "STUDENT": return <BookOpen className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case "ADMIN": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "TEACHER": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "STUDENT": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case "ADMIN": return "Administrator";
      case "TEACHER": return "Teacher";
      case "STUDENT": return "Student";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Sankalp Vidya Academy</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Notification System</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-1.5 px-2">
                  <Badge variant="outline" className={`gap-1 text-xs px-1.5 py-0.5 ${getRoleColor()}`}>
                    {getRoleIcon()}
                  </Badge>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.userId}</p>
                    <Badge variant="outline" className={`gap-1 text-xs w-fit ${getRoleColor()}`}>
                      {getRoleIcon()} {getRoleLabel()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.classes.length > 0 && (
                  <>
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                      <User className="w-3.5 h-3.5 mr-2" />
                      Classes: {user.classes.join(", ")}
                    </DropdownMenuItem>
                  </>
                )}
                {user.subjects.length > 0 && (
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 mr-2" />
                    Subjects: {user.subjects.join(", ")}
                  </DropdownMenuItem>
                )}
                {(user.classes.length > 0 || user.subjects.length > 0) && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
        {user.role === "ADMIN" && <AdminDashboard onNotificationSent={handleNotificationSent} refreshKey={refreshKey} />}
        {user.role === "TEACHER" && <TeacherDashboard onNotificationSent={handleNotificationSent} refreshKey={refreshKey} />}
        {user.role === "STUDENT" && <StudentDashboard refreshKey={refreshKey} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-lg mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
          Sankalp Vidya Academy &copy; {new Date().getFullYear()} &mdash; Notification System
        </div>
      </footer>
    </div>
  );
}

function AdminDashboard({ onNotificationSent, refreshKey }: { onNotificationSent: () => void; refreshKey: number }) {
  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList className="w-full grid grid-cols-3 h-auto p-1">
        <TabsTrigger value="users" className="gap-1 text-xs sm:text-sm py-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">User </span>Mgmt
        </TabsTrigger>
        <TabsTrigger value="send" className="gap-1 text-xs sm:text-sm py-2">
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send </span>Notify
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1 text-xs sm:text-sm py-2">
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">All </span>Notifs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-4">
        <UserManagement />
      </TabsContent>

      <TabsContent value="send" className="mt-4">
        <NotificationForm onSent={onNotificationSent} />
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <NotificationList filter="all" showDelete key={refreshKey} />
      </TabsContent>
    </Tabs>
  );
}

function TeacherDashboard({ onNotificationSent, refreshKey }: { onNotificationSent: () => void; refreshKey: number }) {
  return (
    <Tabs defaultValue="send" className="space-y-4">
      <TabsList className="w-full grid grid-cols-2 h-auto p-1">
        <TabsTrigger value="send" className="gap-1 text-xs sm:text-sm py-2">
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send </span>Notify
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1 text-xs sm:text-sm py-2">
          <Bell className="w-4 h-4" />
          My Notifs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="send" className="mt-4">
        <NotificationForm onSent={onNotificationSent} />
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <NotificationList filter="all" key={refreshKey} />
      </TabsContent>
    </Tabs>
  );
}

function StudentDashboard({ refreshKey }: { refreshKey: number }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">My Notifications</h2>
        </div>
        {user && (
          <div className="text-xs text-muted-foreground">
            {user.classes[0] && <span>{user.classes[0]}</span>}
          </div>
        )}
      </div>
      <NotificationList filter="received" key={refreshKey} />
    </div>
  );
}
