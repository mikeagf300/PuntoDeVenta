"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Caja", path: "/home/dashboard" },
    { label: "Inventario", path: "/home/inventario" },
    { label: "Ventas", path: "/home/ventas" },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 p-4 flex flex-col gap-4 h-screen">
      <h2 className="font-bold text-lg mb-6">Menú</h2>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`px-4 py-2 rounded ${
            pathname === item.path ? "bg-blue-600" : "bg-gray-700"
          } hover:bg-blue-500`}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
