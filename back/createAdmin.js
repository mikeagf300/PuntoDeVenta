const db = require("./db");

async function createAdmin() {
  try {
    await db._init(); // inicializa la base de datos
    const payload = {
      username: "admin",
      password: "1234", // cambia a una contraseña segura
      role: "admin",
      nombre: "Administrador",
    };
    const id = await db.createUsuario(payload);
    console.log("Usuario admin creado con id:", id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
