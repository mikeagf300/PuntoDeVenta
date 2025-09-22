"use client";

import React, { useState } from "react";
import { Usuario } from "@/interfaces/usuarios";

export default function UsuariosAdminTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    role: "user",
  });
  const [error, setError] = useState("");

  // Cargar usuarios al montar
  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch(() => setError("Error al cargar usuarios"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo crear el usuario");
      setForm({ username: "", password: "", nombre: "", role: "user" });
      // Recargar usuarios
      const usuariosActualizados = await fetch(
        "http://localhost:3001/usuarios"
      ).then((r) => r.json());
      setUsuarios(usuariosActualizados);
    } catch {
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        className="mb-6 p-4 border rounded-xl bg-blue-50"
        onSubmit={handleSubmit}
      >
        <h3 className="font-bold mb-2 text-blue-700">Crear usuario</h3>
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Usuario"
            className="px-3 py-2 rounded border w-1/4"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="px-3 py-2 rounded border w-1/4"
            required
          />
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="px-3 py-2 rounded border w-1/4"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="px-3 py-2 rounded border w-1/4"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Crear usuario"}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
      <table className="w-full border rounded-xl shadow">
        <thead className="bg-blue-100">
          <tr>
            <th className="py-2 px-3 text-left">Usuario</th>
            <th className="py-2 px-3 text-left">Nombre</th>
            <th className="py-2 px-3 text-left">Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="hover:bg-blue-50">
              <td className="py-2 px-3 font-semibold">{u.username}</td>
              <td className="py-2 px-3">{u.nombre || "-"}</td>
              <td className="py-2 px-3">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
