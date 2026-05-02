"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Send, CalendarDays, AlertCircle } from "lucide-react";
import { allClasses, getSubjectsForClass } from "@/lib/class-subjects";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

interface NotificationFormProps {
  onSent?: () => void;
}

export function NotificationForm({ onSent }: NotificationFormProps) {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [recipientType, setRecipientType] = useState<string>("");
  const [targetClass, setTargetClass] = useState<string>("");
  const [targetSubject, setTargetSubject] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  // Available recipient types based on role
  const recipientTypes = isAdmin
    ? [
        { value: "ADMIN", label: "Admin" },
        { value: "TEACHER", label: "Teacher" },
        { value: "STUDENT", label: "Student" },
      ]
    : [{ value: "STUDENT", label: "Student" }];

  // Subjects based on selected class
  const availableSubjects = targetClass ? getSubjectsForClass(targetClass) : [];

  // For teachers: show only their assigned classes and subjects
  const teacherClasses = user?.classes || [];
  const teacherSubjects = user?.subjects || [];
  const classOptions = isAdmin ? allClasses : teacherClasses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientType || !topic || !message) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (recipientType === "STUDENT" && (!targetClass || !targetSubject)) {
      toast({ title: "Missing Fields", description: "Class and Subject are required for student notifications", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?.userId,
          senderName: user?.name,
          recipientType,
          targetClass: recipientType === "STUDENT" ? targetClass : "",
          targetSubject: recipientType === "STUDENT" ? targetSubject : "",
          topic,
          message,
          date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send notification");
      }

      toast({ title: "Sent!", description: "Notification sent successfully" });

      // Reset form
      setRecipientType("");
      setTargetClass("");
      setTargetSubject("");
      setTopic("");
      setMessage("");
      setDate(new Date().toISOString().split("T")[0]);

      onSent?.();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send notification",
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
          Send Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-muted-foreground" /> Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Recipient Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Send To</Label>
            <div className="grid grid-cols-3 gap-2">
              {recipientTypes.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => {
                    setRecipientType(rt.value);
                    setTargetClass("");
                    setTargetSubject("");
                  }}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    recipientType === rt.value
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class Selection (for Student recipients) */}
          {recipientType === "STUDENT" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Class</Label>
                <Select value={targetClass} onValueChange={(v) => {
                  setTargetClass(v);
                  setTargetSubject("");
                }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAdmin && teacherClasses.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-500 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No classes assigned. Contact admin.
                  </div>
                )}
              </div>

              {/* Subject Selection */}
              {targetClass && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subject</Label>
                  <Select value={targetSubject} onValueChange={setTargetSubject}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects
                        .filter((s) => isAdmin || teacherSubjects.includes(s))
                        .map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium">Topic</Label>
            <Input
              id="topic"
              placeholder="Enter notification topic / title"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter detailed message..."
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
                Send Notification
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
