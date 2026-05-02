"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, CalendarDays, AlertCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { allClasses, getSubjectsForClass, type ClassSubjectMap } from "@/lib/class-subjects";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NotificationFormProps {
  onSent?: () => void;
}

export function NotificationForm({ onSent }: NotificationFormProps) {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [recipientType, setRecipientType] = useState<string>("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectMap>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
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

  // For teachers: show only their assigned classes
  const teacherSubjects = useMemo(() => {
    if (!user || user.role !== "TEACHER") return {} as ClassSubjectMap;
    return user.subjects as ClassSubjectMap;
  }, [user]);

  const classOptions = isAdmin
    ? allClasses
    : Object.keys(teacherSubjects);

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) => {
      const newClasses = prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls];

      if (!newClasses.includes(cls)) {
        // Remove class from subjects map
        setClassSubjects((prevMap) => {
          const newMap = { ...prevMap };
          delete newMap[cls];
          return newMap;
        });
      } else {
        // Add class with empty subjects initially
        setClassSubjects((prevMap) => ({
          ...prevMap,
          [cls]: prevMap[cls] || [],
        }));
        // Auto-expand the newly added class
        setExpandedClasses((prev) => ({ ...prev, [cls]: true }));
      }

      return newClasses;
    });
  };

  const toggleSubject = (cls: string, subject: string) => {
    setClassSubjects((prevMap) => {
      const current = prevMap[cls] || [];
      const newSubjects = current.includes(subject)
        ? current.filter((s) => s !== subject)
        : [...current, subject];
      return { ...prevMap, [cls]: newSubjects };
    });
  };

  const selectAllSubjects = (cls: string) => {
    const available = getSubjectsForClass(cls);
    // For teachers, filter to only their assigned subjects
    const filtered = isAdmin
      ? available
      : available.filter((s) => (teacherSubjects[cls] || []).includes(s));
    setClassSubjects((prevMap) => ({ ...prevMap, [cls]: filtered }));
  };

  const clearSubjects = (cls: string) => {
    setClassSubjects((prevMap) => ({ ...prevMap, [cls]: [] }));
  };

  const toggleExpand = (cls: string) => {
    setExpandedClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));
  };

  const removeClass = (cls: string) => {
    setSelectedClasses((prev) => prev.filter((c) => c !== cls));
    setClassSubjects((prevMap) => {
      const newMap = { ...prevMap };
      delete newMap[cls];
      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientType || !topic || !message) {
      toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (recipientType === "STUDENT") {
      if (selectedClasses.length === 0) {
        toast({ title: "Missing Classes", description: "At least one class must be selected", variant: "destructive" });
        return;
      }

      // Validate at least one subject per class
      for (const cls of selectedClasses) {
        const subs = classSubjects[cls] || [];
        if (subs.length === 0) {
          toast({ title: "Missing Subjects", description: `At least one subject must be selected for ${cls}`, variant: "destructive" });
          return;
        }
      }
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        senderId: user?.userId,
        senderName: user?.name,
        recipientType,
        topic,
        message,
        date,
      };

      if (recipientType === "STUDENT") {
        body.targetData = classSubjects;
      } else {
        body.targetData = {};
      }

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send notification");
      }

      toast({ title: "Sent!", description: "Notification sent successfully" });

      // Reset form
      setRecipientType("");
      setSelectedClasses([]);
      setClassSubjects({});
      setExpandedClasses({});
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
                    if (rt.value !== "STUDENT") {
                      setSelectedClasses([]);
                      setClassSubjects({});
                    }
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

          {/* Multi-Class Selection (for Student recipients) */}
          {recipientType === "STUDENT" && (
            <>
              {/* Class Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Classes</Label>

                {!isAdmin && classOptions.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm bg-amber-500/10 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    No classes assigned. Contact admin.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                  {classOptions.map((cls) => (
                    <label
                      key={cls}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm",
                        selectedClasses.includes(cls)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedClasses.includes(cls)}
                        onCheckedChange={() => toggleClass(cls)}
                      />
                      <span className="truncate">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Per-Class Subject Selection */}
              {selectedClasses.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Subjects per Class</Label>

                  {selectedClasses.map((cls) => {
                    const availableSubjects = isAdmin
                      ? getSubjectsForClass(cls)
                      : getSubjectsForClass(cls).filter((s) => (teacherSubjects[cls] || []).includes(s));
                    const selectedSubs = classSubjects[cls] || [];
                    const isExpanded = expandedClasses[cls] !== false; // default expanded

                    return (
                      <Card key={cls} className="border-primary/20 overflow-hidden">
                        {/* Class Header */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(cls)}
                          className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedSubs.length > 0 ? "bg-green-500" : "bg-amber-500"
                            )} />
                            <span className="text-sm font-semibold">{cls}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedSubs.length}/{availableSubjects.length} subjects
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeClass(cls); }}
                              className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Subject Checkboxes */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/50">
                            <div className="flex gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => selectAllSubjects(cls)}
                                className="text-xs text-primary hover:underline"
                              >
                                Select All
                              </button>
                              <span className="text-xs text-muted-foreground">|</span>
                              <button
                                type="button"
                                onClick={() => clearSubjects(cls)}
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {availableSubjects.map((sub) => (
                                <label
                                  key={sub}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                                    selectedSubs.includes(sub)
                                      ? "border-primary bg-primary/5"
                                      : "border-border/50 hover:border-primary/30"
                                  )}
                                >
                                  <Checkbox
                                    checked={selectedSubs.includes(sub)}
                                    onCheckedChange={() => toggleSubject(cls, sub)}
                                  />
                                  <span className="truncate text-xs">{sub}</span>
                                </label>
                              ))}
                            </div>
                            {selectedSubs.length === 0 && (
                              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> At least one subject required
                              </p>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
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
