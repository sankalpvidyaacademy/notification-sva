"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Search,
} from "lucide-react";
import { allClasses, getSubjectsForClass } from "@/lib/class-subjects";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  id: string;
  userId: string;
  name: string;
  role: string;
  classes: string[];
  subjects: string[];
}

interface UserManagementProps {
  filterRole?: "TEACHER" | "STUDENT";
}

export function UserManagement({ filterRole }: UserManagementProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formRole, setFormRole] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [formUserId, setFormUserId] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formClasses, setFormClasses] = useState<string[]>([]);
  const [formSubjects, setFormSubjects] = useState<string[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole) params.set("role", filterRole);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterRole, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const availableSubjects = formClasses.length > 0
    ? [...new Set(formClasses.flatMap((c) => getSubjectsForClass(c)))].sort()
    : [];

  const openCreateDialog = (role: "TEACHER" | "STUDENT") => {
    setEditUser(null);
    setFormRole(role);
    setFormUserId("");
    setFormName("");
    setFormPassword("");
    setFormClasses([]);
    setFormSubjects([]);
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserItem) => {
    setEditUser(user);
    setFormRole(user.role as "TEACHER" | "STUDENT");
    setFormUserId(user.userId);
    setFormName(user.name);
    setFormPassword("");
    setFormClasses(user.classes);
    setFormSubjects(user.subjects);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formUserId || !formName || (!editUser && !formPassword)) {
      toast({ title: "Error", description: "All required fields must be filled", variant: "destructive" });
      return;
    }

    try {
      if (editUser) {
        const body: Record<string, unknown> = {
          id: editUser.id,
          userId: formUserId,
          name: formName,
          role: formRole,
          classes: formClasses,
          subjects: formSubjects,
        };
        if (formPassword) body.password = formPassword;

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update user");
        }

        toast({ title: "Success", description: "User updated successfully" });
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: formUserId,
            name: formName,
            password: formPassword,
            role: formRole,
            classes: formClasses,
            subjects: formSubjects,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create user");
        }

        toast({ title: "Success", description: "User created successfully" });
      }

      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const toggleClass = (cls: string) => {
    setFormClasses((prev) => {
      const newClasses = prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls];
      // Remove subjects that are no longer available
      const available = [...new Set(newClasses.flatMap((c) => getSubjectsForClass(c)))];
      setFormSubjects((prevSubjects) => prevSubjects.filter((s) => available.includes(s)));
      return newClasses;
    });
  };

  const toggleSubject = (sub: string) => {
    setFormSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">User Management</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {!filterRole && (
            <>
              <Button size="sm" onClick={() => openCreateDialog("TEACHER")} className="gap-1">
                <Plus className="w-4 h-4" /> Teacher
              </Button>
              <Button size="sm" onClick={() => openCreateDialog("STUDENT")} variant="secondary" className="gap-1">
                <Plus className="w-4 h-4" /> Student
              </Button>
            </>
          )}
          {filterRole === "TEACHER" && (
            <Button size="sm" onClick={() => openCreateDialog("TEACHER")} className="gap-1">
              <Plus className="w-4 h-4" /> Add Teacher
            </Button>
          )}
          {filterRole === "STUDENT" && (
            <Button size="sm" onClick={() => openCreateDialog("STUDENT")} className="gap-1">
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground/70">Create your first user to get started</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <div className="space-y-3 pr-2">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{user.name}</span>
                        <Badge
                          variant={user.role === "TEACHER" ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {user.role === "TEACHER" ? (
                            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Teacher</span>
                          ) : (
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Student</span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {user.userId}</p>
                      {user.classes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.classes.map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {user.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.subjects.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs bg-primary/5">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(user)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["TEACHER", "STUDENT"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setFormRole(r);
                      setFormClasses([]);
                      setFormSubjects([]);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formRole === r
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {r === "TEACHER" ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="formUserId">User ID</Label>
              <Input
                id="formUserId"
                placeholder="Enter unique User ID"
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="formName">Full Name</Label>
              <Input
                id="formName"
                placeholder="Enter full name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="formPassword">
                Password {editUser && <span className="text-muted-foreground text-xs">(leave blank to keep unchanged)</span>}
              </Label>
              <Input
                id="formPassword"
                type="password"
                placeholder={editUser ? "Leave blank to keep current" : "Enter password"}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required={!editUser}
              />
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <Label>
                {formRole === "TEACHER" ? "Assigned Classes" : "Class"}
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {allClasses.map((cls) => (
                  <label
                    key={cls}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                      formClasses.includes(cls)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={formClasses.includes(cls)}
                      onCheckedChange={() => toggleClass(cls)}
                    />
                    <span className="truncate">{cls}</span>
                  </label>
                ))}
              </div>
              {formRole === "STUDENT" && formClasses.length > 1 && (
                <p className="text-xs text-amber-500">Students should typically be assigned to only one class</p>
              )}
            </div>

            {/* Subject Selection */}
            {formClasses.length > 0 && (
              <div className="space-y-2">
                <Label>Subjects</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableSubjects.map((sub) => (
                    <label
                      key={sub}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                        formSubjects.includes(sub)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={formSubjects.includes(sub)}
                        onCheckedChange={() => toggleSubject(sub)}
                      />
                      <span className="truncate">{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editUser ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
