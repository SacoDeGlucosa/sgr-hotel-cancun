const express = require('express');
const router = express.Router();
const { crearReserva, getReservasUsuario, getTodasReservas, getEstadisticas, checkIn, checkOut, cancelarReserva } = require('../controllers/reservasController');

// POST /api/reservas — Crear una nueva reserva
router.post('/', crearReserva);

// GET /api/reservas/usuario/:id_usuario — Ver reservas de un usuario
router.get('/usuario/:id_usuario', getReservasUsuario);

// GET /api/reservas/todas — Ver todas las reservas (admin)
router.get('/todas', getTodasReservas);

// GET /api/reservas/estadisticas — Ver estadísticas (admin)
router.get('/estadisticas', getEstadisticas);

// PUT /api/reservas/:id_reserva/checkin — Hacer check-in
router.put('/:id_reserva/checkin', checkIn);

// PUT /api/reservas/:id_reserva/checkout — Hacer check-out
router.put('/:id_reserva/checkout', checkOut);

// PUT /api/reservas/:id_reserva/cancelar — Cancelar una reserva
router.put('/:id_reserva/cancelar', cancelarReserva);

module.exports = router;