// src/app/HomeWrapper.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import DashboardPage from "@/app/home/dashboard/page";
import LoginPage from "@/app/login/page";
import HomeLayout from "@/app/home/layout";

export default function HomeWrapper() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return (
      <HomeLayout>
        <DashboardPage />
      </HomeLayout>
    );
  }

  return <LoginPage />;
}
