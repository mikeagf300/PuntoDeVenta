export interface Usuario {
  id: number;
  username: string;
  nombre?: string;
  role: "admin" | "user";
}

export interface UsuarioForm {
  username: string;
  password: string;
  nombre?: string;
  role?: "admin" | "user";
}
