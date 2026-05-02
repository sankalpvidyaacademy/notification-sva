"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { LoginPage } from "@/components/sankalp/login-page";
import { Dashboard } from "@/components/sankalp/dashboard";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  // Seed admin user on first load
  useEffect(() => {
    fetch("/api/seed", { method: "POST" })
      .then(() => setReady(true))
      .catch(() => setReady(true)); // Continue even if seed fails
  }, []);

  // Hydration guard - use useSyncExternalStore pattern instead
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to defer setState outside of effect sync path
    requestAnimationFrame(() => setHydrated(true));
  }, []);

  if (!hydrated || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}
