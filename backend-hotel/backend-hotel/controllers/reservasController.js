const db = require('../config/bd');

// ==========================================
// FUNCIÓN 1: CREAR UNA RESERVA (RF-04)
// ==========================================
const crearReserva = (req, res) => {
  // Recibimos estos datos desde el frontend
  const { id_usuario, id_habitacion, fecha_inicio, fecha_fin } = req.body;

  // Validación básica — todos los campos son obligatorios
  if (!id_usuario || !id_habitacion || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Paso 1: Verificar que la habitación esté disponible en esas fechas
  const sqlDisponibilidad = `
    SELECT * FROM reservas 
    WHERE id_habitacion = ? 
    AND estado = 'confirmada'
    AND (
      (fecha_inicio <= ? AND fecha_fin >= ?)
    )
  `;

  db.query(sqlDisponibilidad, [id_habitacion, fecha_fin, fecha_inicio], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });

    // Si hay resultados, la habitación ya está ocupada en esas fechas
    if (results.length > 0) {
      return res.status(400).json({ error: 'La habitación no está disponible en esas fechas' });
    }

    // Paso 2: Si está disponible, crear la reserva
    const sqlCrear = `
      INSERT INTO reservas (id_usuario, id_habitacion, fecha_inicio, fecha_fin, estado)
      VALUES (?, ?, ?, ?, 'confirmada')
    `;

    db.query(sqlCrear, [id_usuario, id_habitacion, fecha_inicio, fecha_fin], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear la reserva' });

      // Paso 3: Cambiar el estado de la habitación a 'reservada'
      db.query("UPDATE habitaciones SET estado = 'reservada' WHERE id_habitacion = ?", [id_habitacion]);

      res.status(201).json({
        mensaje: 'Reserva creada exitosamente',
        id_reserva: result.insertId
      });
    });
  });
};

// ==========================================
// FUNCIÓN 2: VER RESERVAS DE UN USUARIO
// ==========================================
const getReservasUsuario = (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT r.*, h.tipo, h.precio, h.numero
    FROM reservas r
    JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
    WHERE r.id_usuario = ?
    ORDER BY r.fecha_inicio DESC
  `;

  db.query(sql, [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    res.json(results);
  });
};

// ==========================================
// FUNCIÓN 3: OBTENER TODAS LAS RESERVAS (ADMIN)
// ==========================================
const getTodasReservas = (req, res) => {
  const sql = `
    SELECT r.*, 
           h.tipo, h.precio, h.numero,
           u.nombre, u.apellido, u.correo
    FROM reservas r
    JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    ORDER BY r.fecha_inicio DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    res.json(results);
  });
};

// ==========================================
// FUNCIÓN 4: OBTENER ESTADÍSTICAS (ADMIN)
// ==========================================
const getEstadisticas = (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_reservas,
      SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as reservas_activas,
      SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as reservas_canceladas
    FROM reservas
  `;

  const sqlHabitaciones = `
    SELECT 
      COUNT(*) as total_habitaciones,
      SUM(CASE WHEN estado = 'libre' THEN 1 ELSE 0 END) as libres,
      SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END) as reservadas,
      SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas
    FROM habitaciones
  `;

  db.query(sql, (err, reservas) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    
    db.query(sqlHabitaciones, (err, habitaciones) => {
      if (err) return res.status(500).json({ error: 'Error en la base de datos' });
      
      res.json({
        reservas: reservas[0],
        habitaciones: habitaciones[0]
      });
    });
  });
};
// ==========================================
// FUNCIÓN 5: HACER CHECK-IN (RECEPCIONISTA)
// ==========================================
const checkIn = (req, res) => {
  const { id_reserva } = req.params;

  const sql = `
    UPDATE reservas SET estado = 'ocupada' 
    WHERE id_reserva = ? AND estado = 'confirmada'
  `;

  db.query(sql, [id_reserva], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (result.affectedRows === 0) return res.status(400).json({ error: 'La reserva no existe o no está confirmada' });

    // Actualizar estado de la habitación a ocupada
    const sqlHabitacion = `
      UPDATE habitaciones h
      JOIN reservas r ON h.id_habitacion = r.id_habitacion
      SET h.estado = 'ocupada'
      WHERE r.id_reserva = ?
    `;
    db.query(sqlHabitacion, [id_reserva]);

    res.json({ mensaje: 'Check-in realizado exitosamente' });
  });
};

// ==========================================
// FUNCIÓN 6: HACER CHECK-OUT (RECEPCIONISTA)
// ==========================================
const checkOut = (req, res) => {
  const { id_reserva } = req.params;

  const sql = `
    UPDATE reservas SET estado = 'finalizada'
    WHERE id_reserva = ? AND estado = 'ocupada'
  `;

  db.query(sql, [id_reserva], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (result.affectedRows === 0) return res.status(400).json({ error: 'La reserva no existe o no está ocupada' });

    // Actualizar estado de la habitación a libre
    const sqlHabitacion = `
      UPDATE habitaciones h
      JOIN reservas r ON h.id_habitacion = r.id_habitacion
      SET h.estado = 'libre'
      WHERE r.id_reserva = ?
    `;
    db.query(sqlHabitacion, [id_reserva]);

    res.json({ mensaje: 'Check-out realizado exitosamente' });
  });
};
// ==========================================
// FUNCIÓN 7: CANCELAR RESERVA (HUÉSPED)
// ==========================================
const cancelarReserva = (req, res) => {
  const { id_reserva } = req.params;

  const sql = `
    UPDATE reservas SET estado = 'cancelada'
    WHERE id_reserva = ? AND estado = 'confirmada'
  `;

  db.query(sql, [id_reserva], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (result.affectedRows === 0) return res.status(400).json({ error: 'La reserva no existe o no puede cancelarse' });

    // Liberar la habitación
    const sqlHabitacion = `
      UPDATE habitaciones h
      JOIN reservas r ON h.id_habitacion = r.id_habitacion
      SET h.estado = 'libre'
      WHERE r.id_reserva = ?
    `;
    db.query(sqlHabitacion, [id_reserva]);

    res.json({ mensaje: 'Reserva cancelada exitosamente' });
  });
};

module.exports = { crearReserva, getReservasUsuario, getTodasReservas, getEstadisticas, checkIn, checkOut, cancelarReserva };