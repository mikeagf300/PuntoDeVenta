"use client";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Página de Login</h1>
      <button
        onClick={login}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Iniciar Sesión
      </button>
    </div>
  );
}
