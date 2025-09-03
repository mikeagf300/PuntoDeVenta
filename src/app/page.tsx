//src/app/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import DashboardPage from "./home/dashboard/page";
import LoginPage from "./login/page";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return <LoginPage />;
}
