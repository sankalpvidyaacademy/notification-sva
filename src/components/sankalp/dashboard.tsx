"use client";

import { useState } from "react";
import { AppSidebar, type PageKey } from "./app-sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { UserManagement } from "./user-management";
import { NotificationForm } from "./notification-form";
import { NotificationList } from "./notification-list";
import { Bell, Send, Users, GraduationCap, BookOpen, Settings, Shield, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) return null;

  const handleNotificationSent = () => {
    setRefreshKey((k) => k + 1);
  };

  const handlePageChange = (page: PageKey) => {
    setActivePage(page);
    if (page === "all-notifications" || page === "my-notifications") {
      setRefreshKey((k) => k + 1);
    }
  };

  const getPageTitle = (): { title: string; description: string; icon: React.ReactNode } => {
    switch (activePage) {
      case "dashboard":
        return { title: "Dashboard", description: "Overview of your notification system", icon: <LayoutDashboard className="w-5 h-5 text-primary" /> };
      case "create-notification":
        return { title: "Create Notification", description: "Send a new notification", icon: <Send className="w-5 h-5 text-primary" /> };
      case "manage-teachers":
        return { title: "Manage Teachers", description: "Create, edit, and manage teacher accounts", icon: <GraduationCap className="w-5 h-5 text-primary" /> };
      case "manage-students":
        return { title: "Manage Students", description: "Create, edit, and manage student accounts", icon: <BookOpen className="w-5 h-5 text-primary" /> };
      case "all-notifications":
        return { title: "All Notifications", description: "View all system notifications", icon: <Bell className="w-5 h-5 text-primary" /> };
      case "my-notifications":
        return { title: "My Notifications", description: "View your received notifications", icon: <Bell className="w-5 h-5 text-primary" /> };
      case "settings":
        return { title: "Settings", description: "System settings", icon: <Settings className="w-5 h-5 text-primary" /> };
      default:
        return { title: "Dashboard", description: "", icon: <LayoutDashboard className="w-5 h-5 text-primary" /> };
    }
  };

  const pageInfo = getPageTitle();

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome onNavigate={handlePageChange} />;

      case "create-notification":
        return <NotificationForm onSent={handleNotificationSent} />;

      case "manage-teachers":
        return <UserManagement filterRole="TEACHER" />;

      case "manage-students":
        return <UserManagement filterRole="STUDENT" />;

      case "all-notifications":
        return <NotificationList filter="all" showDelete={user.role === "ADMIN"} key={refreshKey} />;

      case "my-notifications":
        return <NotificationList filter="received" key={refreshKey} />;

      case "settings":
        return <SettingsPage />;

      default:
        return <DashboardHome onNavigate={handlePageChange} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile spacer */}
        <div className="h-14 md:hidden" />

        {/* Page Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-40 md:top-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              {pageInfo.icon}
              <div>
                <h1 className="text-lg font-bold">{pageInfo.title}</h1>
                <p className="text-xs text-muted-foreground">{pageInfo.description}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background/80 backdrop-blur-lg mt-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-center text-xs text-muted-foreground">
            Sankalp Vidya Academy &copy; {new Date().getFullYear()} &mdash; Notification System
          </div>
        </footer>
      </div>
    </div>
  );
}

function DashboardHome({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const getRoleColor = () => {
    switch (user.role) {
      case "ADMIN": return "from-amber-500/20 to-amber-500/5 border-amber-500/20";
      case "TEACHER": return "from-blue-500/20 to-blue-500/5 border-blue-500/20";
      case "STUDENT": return "from-green-500/20 to-green-500/5 border-green-500/20";
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "ADMIN": return <Shield className="w-6 h-6 text-amber-500" />;
      case "TEACHER": return <GraduationCap className="w-6 h-6 text-blue-500" />;
      case "STUDENT": return <BookOpen className="w-6 h-6 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className={`bg-gradient-to-br ${getRoleColor()} border`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {getRoleIcon()}
            <div>
              <h2 className="text-xl font-bold">Welcome, {user.name}!</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.role === "ADMIN" && "You have full access to manage the system."}
                {user.role === "TEACHER" && "Send notifications to your assigned students."}
                {user.role === "STUDENT" && "View notifications from your teachers and admin."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.role === "ADMIN" && (
            <>
              <QuickAction
                icon={<Send className="w-5 h-5" />}
                title="Create Notification"
                description="Send a notification to any role"
                onClick={() => onNavigate("create-notification")}
              />
              <QuickAction
                icon={<GraduationCap className="w-5 h-5" />}
                title="Manage Teachers"
                description="Create & manage teacher accounts"
                onClick={() => onNavigate("manage-teachers")}
              />
              <QuickAction
                icon={<BookOpen className="w-5 h-5" />}
                title="Manage Students"
                description="Create & manage student accounts"
                onClick={() => onNavigate("manage-students")}
              />
              <QuickAction
                icon={<Bell className="w-5 h-5" />}
                title="All Notifications"
                description="View system-wide notifications"
                onClick={() => onNavigate("all-notifications")}
              />
            </>
          )}
          {user.role === "TEACHER" && (
            <>
              <QuickAction
                icon={<Send className="w-5 h-5" />}
                title="Create Notification"
                description="Send notification to your students"
                onClick={() => onNavigate("create-notification")}
              />
              <QuickAction
                icon={<Bell className="w-5 h-5" />}
                title="My Notifications"
                description="View your notifications"
                onClick={() => onNavigate("all-notifications")}
              />
            </>
          )}
          {user.role === "STUDENT" && (
            <QuickAction
              icon={<Bell className="w-5 h-5" />}
              title="My Notifications"
              description="View your received notifications"
              onClick={() => onNavigate("my-notifications")}
            />
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Profile</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">User ID:</span>
              <Badge variant="outline" className="font-mono text-xs">{user.userId}</Badge>
            </div>
            {user.classes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">
                  {user.role === "STUDENT" ? "Class:" : "Assigned Classes:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.classes.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
            {user.role === "STUDENT" && Array.isArray(user.subjects) && user.subjects.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">Subjects:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.subjects.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs bg-primary/5">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {user.role === "TEACHER" && typeof user.subjects === "object" && !Array.isArray(user.subjects) && Object.keys(user.subjects).length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Subjects by Class:</span>
                {Object.entries(user.subjects as Record<string, string[]>).map(([cls, subs]) => (
                  <div key={cls} className="pl-2 border-l-2 border-primary/30">
                    <p className="text-xs font-medium mb-1">{cls}</p>
                    <div className="flex flex-wrap gap-1">
                      {subs.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs bg-primary/5">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Name:</span>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">User ID:</span>
            <span className="text-sm font-mono">{user?.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="outline">{user?.role}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
