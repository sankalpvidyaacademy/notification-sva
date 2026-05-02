"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  User,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Shield,
  Trash2,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { ClassSubjectMap } from "@/lib/class-subjects";

interface Notification {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientType: string;
  targetData: ClassSubjectMap;
  topic: string;
  message: string;
  date: string;
  createdAt: string;
}

interface NotificationListProps {
  filter?: "sent" | "received" | "all";
  showDelete?: boolean;
}

export function NotificationList({ filter = "all", showDelete = false }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<string>("ALL");
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        userId: user.id,
        role: user.role,
      });

      if (user.role === "STUDENT") {
        params.set("classes", JSON.stringify(user.classes));
        params.set("subjects", JSON.stringify(user.subjects));
      }

      const res = await fetch(`/api/notifications?${params}`);
      const data = await res.json();

      let notifs: Notification[] = data.notifications || [];

      // Apply filter
      if (filter === "sent") {
        notifs = notifs.filter((n) => n.senderId === user.userId);
      } else if (filter === "received") {
        notifs = notifs.filter((n) => n.senderId !== user.userId);
      }

      setNotifications(notifs);
    } catch {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, filter, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Deleted", description: "Notification deleted" });
      fetchNotifications();
    } catch {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case "ADMIN": return <Shield className="w-3 h-3" />;
      case "TEACHER": return <GraduationCap className="w-3 h-3" />;
      case "STUDENT": return <BookOpen className="w-3 h-3" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  const getRecipientBadge = (type: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      TEACHER: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      STUDENT: "bg-green-500/10 text-green-600 dark:text-green-400",
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  };

  const getSenderRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      TEACHER: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      STUDENT: "bg-green-500/10 text-green-600 dark:text-green-400",
    };
    return colors[role] || "bg-gray-500/10 text-gray-600";
  };

  const renderTargetData = (targetData: ClassSubjectMap) => {
    const entries = Object.entries(targetData);
    if (entries.length === 0) return null;

    return (
      <div className="space-y-1 mt-1">
        {entries.map(([cls, subs]) => (
          <div key={cls} className="pl-2 border-l-2 border-primary/20">
            <span className="text-xs text-muted-foreground">{cls}:</span>{" "}
            {subs.map((s) => (
              <Badge key={`${cls}-${s}`} variant="outline" className="text-xs bg-primary/5 mr-0.5">
                {s}
              </Badge>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderNotificationCard = (notif: Notification) => (
    <Card key={notif.id} className="group hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight">{notif.topic}</h3>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => handleDelete(notif.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notif.message}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs gap-1">
              <User className="w-3 h-3" /> {notif.senderName}
            </Badge>
            {notif.senderRole && (
              <Badge variant="outline" className={`text-xs gap-1 ${getSenderRoleBadge(notif.senderRole)}`}>
                {notif.senderRole}
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs gap-1 ${getRecipientBadge(notif.recipientType)}`}>
              {getRecipientIcon(notif.recipientType)} {notif.recipientType}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <CalendarDays className="w-3 h-3" /> {notif.date}
            </Badge>
          </div>

          {/* Target Data */}
          {renderTargetData(notif.targetData)}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground/70">Notifications will appear here when received</p>
        </CardContent>
      </Card>
    );
  }

  // For Admin: Tab-based filtering by sender role
  if (user?.role === "ADMIN" && filter === "all") {
    const adminNotifs = notifications.filter((n) => (n.senderRole || "ADMIN") === "ADMIN");
    const teacherNotifs = notifications.filter((n) => n.senderRole === "TEACHER");
    const studentNotifs = notifications.filter((n) => n.senderRole === "STUDENT");

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchNotifications} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        <Tabs value={adminTab} onValueChange={setAdminTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="ALL" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="ADMIN" className="text-xs">
              Admin ({adminNotifs.length})
            </TabsTrigger>
            <TabsTrigger value="TEACHER" className="text-xs">
              Teacher ({teacherNotifs.length})
            </TabsTrigger>
            <TabsTrigger value="STUDENT" className="text-xs">
              Student ({studentNotifs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ALL" className="mt-3">
            <ScrollArea className="max-h-[calc(100vh-360px)]">
              <div className="space-y-3 pr-2">
                {notifications.map(renderNotificationCard)}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ADMIN" className="mt-3">
            {adminNotifs.length === 0 ? (
              <EmptyTabMessage role="Admin" />
            ) : (
              <ScrollArea className="max-h-[calc(100vh-360px)]">
                <div className="space-y-3 pr-2">
                  {adminNotifs.map(renderNotificationCard)}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="TEACHER" className="mt-3">
            {teacherNotifs.length === 0 ? (
              <EmptyTabMessage role="Teacher" />
            ) : (
              <ScrollArea className="max-h-[calc(100vh-360px)]">
                <div className="space-y-3 pr-2">
                  {teacherNotifs.map(renderNotificationCard)}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="STUDENT" className="mt-3">
            {studentNotifs.length === 0 ? (
              <EmptyTabMessage role="Student" />
            ) : (
              <ScrollArea className="max-h-[calc(100vh-360px)]">
                <div className="space-y-3 pr-2">
                  {studentNotifs.map(renderNotificationCard)}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Non-admin view or filtered view
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchNotifications} className="gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <ScrollArea className="max-h-[calc(100vh-300px)]">
        <div className="space-y-3 pr-2">
          {notifications.map(renderNotificationCard)}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmptyTabMessage({ role }: { role: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Inbox className="w-10 h-10 text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground text-sm">No notifications from {role}</p>
      </CardContent>
    </Card>
  );
}
