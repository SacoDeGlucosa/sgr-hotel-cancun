require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares — preparan el servidor para recibir peticiones
app.use(cors());
app.use(express.json());

// Importar rutas
const habitacionesRoutes = require('./routes/habitacionesRoutes');
const authRoutes = require('./routes/authRoutes');
const reservasRoutes = require('./routes/reservasRoutes'); // ← NUEVO
// Registrar rutas
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservasRoutes); // ← NUEVO
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Hotel funcionando 🏨');
});
const listEndpoints = require('express-list-endpoints');
console.log(listEndpoints(app));
// Encender el servidor
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});