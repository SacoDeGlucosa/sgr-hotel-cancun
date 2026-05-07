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
// ==========================================
// FUNCIÓN 6: HACER CHECK-OUT (RF-08)
// Calcula la facturación final: precio × noches + cargos adicionales (opcional).
// El recepcionista puede pasar { cargos_adicionales: 50000 } en el body si aplica.
// ==========================================
const checkOut = (req, res) => {
  const { id_reserva } = req.params;
  const cargosAdicionales = parseFloat(req.body?.cargos_adicionales) || 0;

  // Paso 1: traer datos de la reserva y la habitación para calcular el total
  const sqlGet = `
    SELECT r.id_reserva, r.id_habitacion, r.estado,
           DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches,
           h.precio
    FROM reservas r
    JOIN habitaciones h ON h.id_habitacion = r.id_habitacion
    WHERE r.id_reserva = ?
  `;

  db.query(sqlGet, [id_reserva], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = results[0];

    if (reserva.estado !== 'ocupada') {
      return res.status(400).json({
        error: `No se puede hacer check-out de una reserva en estado: ${reserva.estado}`
      });
    }

    // Paso 2: calcular factura
    const subtotal = parseFloat(reserva.precio) * reserva.noches;
    const totalPagado = subtotal + cargosAdicionales;

    // Paso 3: actualizar reserva con estado, total y fecha de checkout
    const sqlUpdate = `
      UPDATE reservas
      SET estado = 'finalizada',
          total_pagado = ?,
          fecha_checkout = NOW()
      WHERE id_reserva = ?
    `;

    db.query(sqlUpdate, [totalPagado, id_reserva], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error en la base de datos' });

      // Paso 4: liberar la habitación
      db.query(
        'UPDATE habitaciones SET estado = "libre" WHERE id_habitacion = ?',
        [reserva.id_habitacion]
      );

      // Paso 5: devolver la "factura" al recepcionista
      res.json({
        mensaje: 'Check-out realizado exitosamente',
        factura: {
          id_reserva: reserva.id_reserva,
          noches: reserva.noches,
          precio_por_noche: parseFloat(reserva.precio).toFixed(2),
          subtotal: subtotal.toFixed(2),
          cargos_adicionales: cargosAdicionales.toFixed(2),
          total_pagado: totalPagado.toFixed(2)
        }
      });
    });
  });
};
// ==========================================
// FUNCIÓN 7: CANCELAR RESERVA (RF-06)
// Aplica política de penalización según días previos al check-in:
//   ≥7 días     →   0% penalización (reembolso 100%)
//   3-6 días    →  30% penalización (reembolso 70%)
//   1-2 días    →  50% penalización (reembolso 50%)
//   0 días o ya pasó → 100% penalización (reembolso 0%)
// ==========================================
const cancelarReserva = (req, res) => {
  const { id_reserva } = req.params;

  // Paso 1: traer la reserva para conocer fecha_inicio, costo y estado
  const sqlGet = `
    SELECT r.id_reserva, r.id_habitacion, r.fecha_inicio, r.estado, h.precio,
           DATEDIFF(r.fecha_fin, r.fecha_inicio) AS noches
    FROM reservas r
    JOIN habitaciones h ON h.id_habitacion = r.id_habitacion
    WHERE r.id_reserva = ?
  `;

  db.query(sqlGet, [id_reserva], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = results[0];

    // Validación de estado
    if (reserva.estado !== 'confirmada') {
      return res.status(400).json({
        error: `No se puede cancelar una reserva en estado: ${reserva.estado}`
      });
    }

    // Paso 2: calcular días restantes hasta el check-in
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // normalizar a medianoche
    const fechaInicio = new Date(reserva.fecha_inicio);
    fechaInicio.setHours(0, 0, 0, 0);
    const msPorDia = 1000 * 60 * 60 * 24;
    const diasRestantes = Math.floor((fechaInicio - hoy) / msPorDia);

    // Paso 3: determinar porcentaje de penalización
    let porcentajePenalizacion;
    if (diasRestantes >= 7)        porcentajePenalizacion = 0;
    else if (diasRestantes >= 3)   porcentajePenalizacion = 30;
    else if (diasRestantes >= 1)   porcentajePenalizacion = 50;
    else                           porcentajePenalizacion = 100;

    // Paso 4: calcular montos
    const costoTotal = parseFloat(reserva.precio) * reserva.noches;
    const montoPenalizacion = costoTotal * (porcentajePenalizacion / 100);
    const montoReembolso = costoTotal - montoPenalizacion;

    // Paso 5: actualizar la reserva con los montos y la fecha de cancelación
    const sqlUpdate = `
      UPDATE reservas
      SET estado = 'cancelada',
          penalizacion = ?,
          monto_reembolso = ?,
          fecha_cancelacion = NOW()
      WHERE id_reserva = ?
    `;

    db.query(sqlUpdate, [montoPenalizacion, montoReembolso, id_reserva], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al cancelar la reserva' });

      // Paso 6: liberar la habitación
      db.query(
        'UPDATE habitaciones SET estado = "libre" WHERE id_habitacion = ?',
        [reserva.id_habitacion]
      );

      res.json({
        mensaje: 'Reserva cancelada exitosamente',
        diasPrevios: diasRestantes,
        porcentajePenalizacion,
        costoTotal: costoTotal.toFixed(2),
        montoPenalizacion: montoPenalizacion.toFixed(2),
        montoReembolso: montoReembolso.toFixed(2)
      });
    });
  });
};

// ==========================================
// FUNCIÓN 8: MODIFICAR RESERVA (RF-05)
// Solo antes del check-in y si la habitación está disponible en el nuevo rango
// ==========================================
const modificarReserva = (req, res) => {
  const { id_reserva } = req.params;
  const { fecha_inicio, fecha_fin } = req.body;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'Las nuevas fechas son obligatorias' });
  }

  if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
    return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la fecha de ingreso' });
  }

  // Paso 1: Verificar que la reserva exista y no esté finalizada/cancelada
  const sqlVerificar = `
    SELECT * FROM reservas WHERE id_reserva = ?
  `;

  db.query(sqlVerificar, [id_reserva], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = results[0];

    if (['finalizada', 'cancelada', 'ocupada'].includes(reserva.estado)) {
      return res.status(400).json({ error: 'No se puede modificar una reserva en estado: ' + reserva.estado });
    }

    // Paso 2: Verificar disponibilidad en el nuevo rango (excluyendo la reserva actual)
    const sqlDisponibilidad = `
      SELECT * FROM reservas
      WHERE id_habitacion = ?
      AND id_reserva != ?
      AND estado = 'confirmada'
      AND (fecha_inicio <= ? AND fecha_fin >= ?)
    `;

    db.query(sqlDisponibilidad, [reserva.id_habitacion, id_reserva, fecha_fin, fecha_inicio], (err2, conflicts) => {
      if (err2) return res.status(500).json({ error: 'Error al verificar disponibilidad' });

      if (conflicts.length > 0) {
        return res.status(400).json({ error: 'La habitación no está disponible en las nuevas fechas seleccionadas' });
      }

      // Paso 3: Actualizar las fechas
      db.query(
        'UPDATE reservas SET fecha_inicio = ?, fecha_fin = ? WHERE id_reserva = ?',
        [fecha_inicio, fecha_fin, id_reserva],
        (err3, result) => {
          if (err3) return res.status(500).json({ error: 'Error al modificar la reserva' });
          res.json({ mensaje: 'Reserva modificada exitosamente' });
        }
      );
    });
  });
};

module.exports = { crearReserva, getReservasUsuario, getTodasReservas, getEstadisticas, checkIn, checkOut, cancelarReserva, modificarReserva };