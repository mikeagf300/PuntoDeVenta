"use client";

export default function Navbar() {
  return (
    <header className="w-full mb-6">
      <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
        {/* Título o logo */}
        <h1 className="text-xl font-bold ml-18">Punto de Venta</h1>

        {/* Usuario + Logout alineados a la derecha */}
        <div className="flex items-center gap-4">
          <p className="font-semibold">Usuario: Admin</p>
          <button className="px-4 py-2 rounded-lg text-white bg-red-600/80 hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
