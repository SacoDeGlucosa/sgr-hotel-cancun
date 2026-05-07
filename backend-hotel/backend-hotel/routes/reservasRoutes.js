const express = require('express');
const router = express.Router();
const {
  crearReserva,
  getReservasUsuario,
  getTodasReservas,
  getEstadisticas,
  checkIn,
  checkOut,
  cancelarReserva,
  modificarReserva
} = require('../controllers/reservasController');

const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

// RF-04: Crear reserva (cualquier usuario autenticado)
router.post('/', verifyToken, crearReserva);

// RF-03: Ver reservas del propio usuario
router.get('/usuario/:id_usuario', verifyToken, getReservasUsuario);

// RF-05: Modificar reserva (huésped modifica la suya)
router.put('/:id_reserva/modificar', verifyToken, modificarReserva);

// RF-06: Cancelar reserva (huésped cancela la suya)
router.put('/:id_reserva/cancelar', verifyToken, cancelarReserva);

// RF-07: Check-in — solo recepcionista o administrador
router.put('/:id_reserva/checkin', verifyToken, authorizeRoles('recepcionista', 'administrador'), checkIn);

// RF-08: Check-out — solo recepcionista o administrador
router.put('/:id_reserva/checkout', verifyToken, authorizeRoles('recepcionista', 'administrador'), checkOut);

// RF-10: Todas las reservas — administrador y recepcionista (este último las necesita para check-in/out)
router.get('/todas', verifyToken, authorizeRoles('administrador', 'recepcionista'), getTodasReservas);

// RF-10: Estadísticas / reportes — solo administrador
router.get('/estadisticas', verifyToken, authorizeRoles('administrador'), getEstadisticas);

module.exports = router;
