// src/app/home/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/home/dashboard");
}
