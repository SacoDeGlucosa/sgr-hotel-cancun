const express = require('express');
const router = express.Router();
const {
  getHabitaciones,
  getHabitacionById,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion
} = require('../controllers/habitacionesController');

const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

// GET público: cualquiera puede consultar disponibilidad (RF-03)
router.get('/', getHabitaciones);

// RF-09: CRUD solo para administrador
router.get('/:id', verifyToken, authorizeRoles('administrador'), getHabitacionById);
router.post('/', verifyToken, authorizeRoles('administrador'), crearHabitacion);
router.put('/:id', verifyToken, authorizeRoles('administrador'), actualizarHabitacion);
router.delete('/:id', verifyToken, authorizeRoles('administrador'), eliminarHabitacion);

module.exports = router;
