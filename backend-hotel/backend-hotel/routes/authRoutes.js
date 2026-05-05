const express = require('express');
const router = express.Router();
// Asegúrate de importar ambas aquí también:
const { register, login } = require('../controllers/authController'); 

// Tus rutas
router.post('/register', register);
router.post('/login', login); // Esta es la ruta nueva que conectará con tu frontend

module.exports = router;