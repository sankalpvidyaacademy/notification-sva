"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { LoginPage } from "@/components/sankalp/login-page";
import { Dashboard } from "@/components/sankalp/dashboard";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Seed admin user on first load
  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).catch(() => {});
  }, []);

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}
