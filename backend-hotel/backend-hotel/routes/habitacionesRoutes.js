const express = require('express');
const router = express.Router();
const { getHabitaciones } = require('../controllers/habitacionesController');

router.get('/', getHabitaciones);

module.exports = router;