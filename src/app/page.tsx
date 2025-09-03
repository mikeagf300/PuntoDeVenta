//src/app/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import HomeWrapper from "@/components/HomeWrapper/HomeWrapper";
import LoginPage from "./login/page";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <HomeWrapper />;
  }

  return <LoginPage />;
}
