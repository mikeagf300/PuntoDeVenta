import UsuariosAdminTable from "@/components/Users/UsuariosAdminTable";

export default function UsuariosAdminPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Gestión de Usuarios
      </h2>
      <UsuariosAdminTable />
    </div>
  );
}
