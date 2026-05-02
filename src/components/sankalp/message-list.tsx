"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Reply,
  Shield,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Inbox,
  Send,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  topic: string;
  message: string;
  parentMsgId: string | null;
  createdAt: string;
}

interface MessageListProps {
  viewMode?: "all" | "sent" | "received";
}

export function MessageList({ viewMode = "all" }: MessageListProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyTopic, setReplyTopic] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        userId: user.userId,
        role: user.role,
      });

      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();

      let msgs: MessageItem[] = data.messages || [];

      // Apply filter
      if (viewMode === "sent") {
        msgs = msgs.filter((m) => m.senderId === user.userId);
      } else if (viewMode === "received") {
        msgs = msgs.filter((m) => m.receiverId === user.userId);
      }

      setMessages(msgs);
    } catch {
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, viewMode, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Group messages into threads
  const parentMessages = messages.filter((m) => !m.parentMsgId);
  const getReplies = (parentId: string) => messages.filter((m) => m.parentMsgId === parentId);

  const handleReply = async (parentMsg: MessageItem) => {
    if (!replyMessage.trim()) {
      toast({ title: "Error", description: "Reply message cannot be empty", variant: "destructive" });
      return;
    }

    setReplyLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?.userId,
          senderName: user?.name,
          senderRole: user?.role,
          receiverId: parentMsg.senderId,
          receiverName: parentMsg.senderName,
          receiverRole: parentMsg.senderRole,
          topic: replyTopic || `Re: ${parentMsg.topic}`,
          message: replyMessage,
          parentMsgId: parentMsg.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reply");
      }

      toast({ title: "Replied!", description: "Reply sent successfully" });
      setReplyingTo(null);
      setReplyMessage("");
      setReplyTopic("");
      fetchMessages();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const toggleThread = (msgId: string) => {
    setExpandedThreads((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <Shield className="w-3 h-3" />;
      case "TEACHER": return <GraduationCap className="w-3 h-3" />;
      case "STUDENT": return <BookOpen className="w-3 h-3" />;
      default: return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      TEACHER: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      STUDENT: "bg-green-500/10 text-green-600 dark:text-green-400",
    };
    return colors[role] || "bg-gray-500/10 text-gray-600";
  };

  const canReply = (msg: MessageItem) => {
    if (!user) return false;
    // Admin can reply to anyone
    if (user.role === "ADMIN") return msg.senderId !== user.userId;
    // Teacher can reply to students
    if (user.role === "TEACHER") return msg.senderRole === "STUDENT";
    // Student can reply to messages they received
    if (user.role === "STUDENT") return msg.receiverId === user.userId;
    return false;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground/70">Messages will appear here when received</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">{parentMessages.length} conversation{parentMessages.length !== 1 ? "s" : ""}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessages} className="gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <ScrollArea className="max-h-[calc(100vh-300px)]">
        <div className="space-y-3 pr-2">
          {parentMessages.map((parentMsg) => {
            const replies = getReplies(parentMsg.id);
            const isExpanded = expandedThreads[parentMsg.id] !== false;
            const isReplying = replyingTo === parentMsg.id;

            return (
              <Card key={parentMsg.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Parent Message Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base leading-tight">{parentMsg.topic}</h3>
                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleThread(parentMsg.id)}
                          className="shrink-0 p-1 rounded hover:bg-accent transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Parent Message Body */}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parentMsg.message}</p>

                    {/* Parent Message Meta */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="outline" className={`text-xs gap-1 ${getRoleBadge(parentMsg.senderRole)}`}>
                        {getRoleIcon(parentMsg.senderRole)} {parentMsg.senderName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Badge variant="outline" className={`text-xs gap-1 ${getRoleBadge(parentMsg.receiverRole)}`}>
                        {getRoleIcon(parentMsg.receiverRole)} {parentMsg.receiverName}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(parentMsg.createdAt)}
                      </Badge>
                    </div>

                    {/* Reply count indicator */}
                    {replies.length > 0 && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => toggleThread(parentMsg.id)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Reply className="w-3 h-3" />
                        {replies.length} repl{replies.length !== 1 ? "ies" : "y"}
                      </button>
                    )}

                    {/* Replies Thread */}
                    {isExpanded && replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-primary/20">
                        {replies.map((reply) => (
                          <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <Badge variant="outline" className={`text-xs gap-1 ${getRoleBadge(reply.senderRole)}`}>
                                {getRoleIcon(reply.senderRole)} {reply.senderName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">→</span>
                              <Badge variant="outline" className={`text-xs gap-1 ${getRoleBadge(reply.receiverRole)}`}>
                                {getRoleIcon(reply.receiverRole)} {reply.receiverName}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formatTime(reply.createdAt)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {canReply(parentMsg) && (
                      <div className="mt-2">
                        {isReplying ? (
                          <div className="space-y-3 bg-muted/30 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <Reply className="w-3.5 h-3.5" /> Reply to {parentMsg.senderName}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyMessage("");
                                  setReplyTopic("");
                                }}
                                className="p-1 rounded hover:bg-accent text-muted-foreground"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <Input
                              placeholder={`Re: ${parentMsg.topic}`}
                              value={replyTopic}
                              onChange={(e) => setReplyTopic(e.target.value)}
                              className="h-9 text-sm rounded-lg"
                            />
                            <Textarea
                              placeholder="Type your reply..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              rows={3}
                              className="resize-none text-sm rounded-lg"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(parentMsg)}
                              disabled={replyLoading || !replyMessage.trim()}
                              className="gap-1"
                            >
                              {replyLoading ? (
                                <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Send Reply
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(parentMsg.id)}
                            className="text-primary gap-1 mt-1"
                          >
                            <Reply className="w-3.5 h-3.5" /> Reply
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
