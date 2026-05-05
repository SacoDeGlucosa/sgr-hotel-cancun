# Backend — Hotel Cancún Resort & Spa

API REST en **Node.js + Express** para el sistema de gestión de reservas.

> 📖 La guía completa de instalación y configuración está en el [README principal del proyecto](../../README.md).

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la base de datos (solo la primera vez o cuando quieras resetear)
mysql -u root -p < schema.sql

# 3. Crear usuarios de prueba
node seed-usuarios.js

# 4. Arrancar el servidor
node index.js
```

El servidor corre en `http://localhost:3000`.

---

## 🔌 Endpoints disponibles

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción | RF |
|---|---|---|---|
| POST | `/register` | Registrar nuevo huésped | RF-01 |
| POST | `/login`    | Iniciar sesión          | RF-02 |

### Habitaciones (`/api/habitaciones`)
| Método | Ruta | Descripción | RF |
|---|---|---|---|
| GET | `/` | Listar todas las habitaciones | RF-03 |

### Reservas (`/api/reservas`)
| Método | Ruta | Descripción | RF |
|---|---|---|---|
| POST | `/`                              | Crear reserva                       | RF-04 |
| GET  | `/usuario/:id_usuario`           | Reservas de un huésped              | —     |
| GET  | `/todas`                         | Todas las reservas (admin/recep.)   | RF-10 |
| GET  | `/estadisticas`                  | Estadísticas globales (admin)       | RF-10 |
| PUT  | `/:id_reserva/checkin`           | Registrar check-in                  | RF-07 |
| PUT  | `/:id_reserva/checkout`          | Registrar check-out                 | RF-08 |
| PUT  | `/:id_reserva/cancelar`          | Cancelar reserva                    | RF-06 |

---

## 🗂 Estructura de carpetas

```
backend-hotel/
├── config/
│   └── bd.js                  ← Conexión a MySQL
├── controllers/
│   ├── authController.js      ← Lógica de auth
│   ├── habitacionesController.js
│   └── reservasController.js
├── routes/
│   ├── authRoutes.js
│   ├── habitacionesRoutes.js
│   └── reservasRoutes.js
├── schema.sql                 ← Script de creación de la BD
├── seed-usuarios.js           ← Script para crear usuarios de prueba
├── index.js                   ← Punto de entrada
└── package.json
```

---

## 🔧 Variables de entorno

El archivo `.env` (no se sube a GitHub) debe contener:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=hotel
DB_PORT=3306
JWT_SECRET=cadena_larga_y_aleatoria_para_firmar_tokens
```
