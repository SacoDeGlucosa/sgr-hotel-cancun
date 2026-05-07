const db = require('../config/bd');

// RF-03 / consulta pública: listar habitaciones (disponibles o todas)
exports.getHabitaciones = (req, res) => {
  const sql = "SELECT * FROM habitaciones";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    res.json(results);
  });
};

// RF-09: Obtener una habitación por ID (admin)
exports.getHabitacionById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM habitaciones WHERE id_habitacion = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(404).json({ error: "Habitación no encontrada" });
    res.json(results[0]);
  });
};

// RF-09: Crear habitación (admin)
exports.crearHabitacion = (req, res) => {
  const { numero, tipo, precio, capacidad, descripcion } = req.body;

  if (!numero || !tipo || !precio) {
    return res.status(400).json({ error: "Número, tipo y precio son obligatorios" });
  }

  if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return res.status(400).json({ error: "El precio debe ser un valor numérico válido mayor a 0" });
  }

  const sql = `
    INSERT INTO habitaciones (numero, tipo, precio, capacidad, descripcion, estado)
    VALUES (?, ?, ?, ?, ?, 'libre')
  `;

  db.query(sql, [numero, tipo, precio, capacidad || 2, descripcion || ''], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "El número de habitación ya existe" });
      return res.status(500).json({ error: "Error al crear la habitación" });
    }
    res.status(201).json({ mensaje: "Habitación creada exitosamente", id_habitacion: result.insertId });
  });
};

// RF-09: Actualizar habitación (admin)
exports.actualizarHabitacion = (req, res) => {
  const { id } = req.params;
  const { numero, tipo, precio, capacidad, descripcion, estado } = req.body;

  if (precio !== undefined && (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0)) {
    return res.status(400).json({ error: "El precio debe ser un valor numérico válido mayor a 0" });
  }

  const sql = `
    UPDATE habitaciones
    SET numero = COALESCE(?, numero),
        tipo = COALESCE(?, tipo),
        precio = COALESCE(?, precio),
        capacidad = COALESCE(?, capacidad),
        descripcion = COALESCE(?, descripcion),
        estado = COALESCE(?, estado)
    WHERE id_habitacion = ?
  `;

  db.query(sql, [numero, tipo, precio, capacidad, descripcion, estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al actualizar la habitación" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Habitación no encontrada" });
    res.json({ mensaje: "Habitación actualizada exitosamente" });
  });
};

// RF-09: Eliminar habitación (admin) — solo si está libre
exports.eliminarHabitacion = (req, res) => {
  const { id } = req.params;

  // Verificar que no tenga reservas activas
  const sqlCheck = "SELECT estado FROM habitaciones WHERE id_habitacion = ?";
  db.query(sqlCheck, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(404).json({ error: "Habitación no encontrada" });
    if (results[0].estado !== 'libre') {
      return res.status(400).json({ error: "No se puede eliminar una habitación que no está libre" });
    }

    db.query("DELETE FROM habitaciones WHERE id_habitacion = ?", [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Error al eliminar la habitación" });
      res.json({ mensaje: "Habitación eliminada exitosamente" });
    });
  });
};
