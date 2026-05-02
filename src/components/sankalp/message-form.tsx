"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Shield, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  userId: string;
  name: string;
  role: string;
}

interface MessageFormProps {
  onSent?: () => void;
}

export function MessageForm({ onSent }: MessageFormProps) {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [recipientType, setRecipientType] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch teachers list
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/users?role=TEACHER");
        const data = await res.json();
        setTeachers(data.users || []);
      } catch {
        // Silently fail
      }
    }
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientType || !topic || !message) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (recipientType === "TEACHER" && !selectedTeacherId) {
      toast({ title: "Missing Teacher", description: "Please select a teacher", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let receiverId: string;
      let receiverName: string;
      let receiverRole: string;

      if (recipientType === "ADMIN") {
        // Find admin user
        const res = await fetch("/api/users?role=ADMIN");
        const data = await res.json();
        const admin = data.users?.[0];
        if (!admin) {
          toast({ title: "Error", description: "No admin found", variant: "destructive" });
          return;
        }
        receiverId = admin.userId;
        receiverName = admin.name;
        receiverRole = "ADMIN";
      } else {
        const teacher = teachers.find((t) => t.userId === selectedTeacherId);
        if (!teacher) {
          toast({ title: "Error", description: "Selected teacher not found", variant: "destructive" });
          return;
        }
        receiverId = teacher.userId;
        receiverName = teacher.name;
        receiverRole = "TEACHER";
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?.userId,
          senderName: user?.name,
          senderRole: user?.role,
          receiverId,
          receiverName,
          receiverRole,
          topic,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      toast({ title: "Sent!", description: "Message sent successfully" });

      // Reset form
      setRecipientType("");
      setSelectedTeacherId("");
      setTopic("");
      setMessage("");

      onSent?.();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="w-5 h-5 text-primary" />
          Send Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recipient Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Send To</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRecipientType("ADMIN");
                  setSelectedTeacherId("");
                }}
                className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  recipientType === "ADMIN"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRecipientType("TEACHER")}
                className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  recipientType === "TEACHER"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Teacher
              </button>
            </div>
          </div>

          {/* Teacher Selection */}
          {recipientType === "TEACHER" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Teacher</Label>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">No teachers available</p>
              ) : (
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.userId} value={teacher.userId}>
                        {teacher.name} ({teacher.userId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="msg-topic" className="text-sm font-medium">Topic</Label>
            <Input
              id="msg-topic"
              placeholder="Enter message topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="msg-message" className="text-sm font-medium">Message</Label>
            <Textarea
              id="msg-message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 font-semibold rounded-xl shadow-lg shadow-primary/25"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
