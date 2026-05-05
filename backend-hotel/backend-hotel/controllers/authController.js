const db = require('../config/bd'); // O la ruta donde lo hayas dejado
const bcrypt = require('bcryptjs');

// ==========================================
// FUNCIÓN 1: REGISTRAR USUARIO
// ==========================================
const register = async (req, res) => {
  const { nombre, apellido, correo, fecha_nacimiento, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO usuarios (nombre, apellido, correo, fecha_nacimiento, contraseña, rol, verificado) VALUES (?, ?, ?, ?, ?, 'huesped', false)";
    
    db.query(query, [nombre, apellido, correo, fecha_nacimiento, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "El correo ya está registrado" });
        console.log(err);
        return res.status(500).json({ error: "Error en servidor al guardar" });
      }
      res.status(201).json({ mensaje: "Usuario creado. Por favor verifica tu correo." });
    });
  } catch (error) { 
    res.status(500).json({ error: "Error fatal" }); 
  }
};

// ==========================================
// FUNCIÓN 2: INICIAR SESIÓN (NUEVO)
// ==========================================
const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const query = "SELECT * FROM usuarios WHERE correo = ?";
    db.query(query, [correo], async (err, result) => {
      if (err) return res.status(500).json({ error: "Error en servidor" });
      
      // Si no hay resultados, el correo no existe en la BD
      if (result.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

      const usuario = result[0];

      // Comparamos la contraseña que escribió con la encriptada
      const match = await bcrypt.compare(password, usuario.contraseña);
      if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

      // Todo es correcto, enviamos los datos al frontend
      res.status(200).json({
        mensaje: "Login exitoso",
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol, 
          verificado: usuario.verificado
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Error fatal" });
  }
};

// ==========================================
// EXPORTAMOS AMBAS FUNCIONES
// ==========================================
module.exports = { register, login };