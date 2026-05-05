# 🏨 Sistema de Gestión de Reservas — Hotel Cancún Resort & Spa

Sistema web full-stack para la gestión integral de reservas de un hotel boutique de 24 habitaciones, desarrollado como proyecto semestral del curso **Ingeniería de Software II** (2026-1S) en la Universidad Central.

---

## 📋 Tabla de contenido

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación paso a paso](#-instalación-paso-a-paso)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [Credenciales de prueba](#-credenciales-de-prueba)
- [Equipo](#-equipo)
- [Documentación adicional](#-documentación-adicional)

---

## 📖 Descripción

El sistema permite a un hotel boutique gestionar el ciclo completo de reservas con tres roles diferenciados:

- **Huésped:** registro de cuenta, búsqueda de habitaciones por capacidad y fechas, creación y cancelación de reservas, visualización de su historial de reservas.
- **Recepcionista:** registro de check-in y check-out, gestión de modificaciones a reservas confirmadas.
- **Administrador:** consulta de reportes de ocupación, supervisión de todas las reservas, gestión de habitaciones del hotel.

El sistema cumple con la especificación de requisitos documentada bajo el estándar **IEEE 830-1998**.

---

## 🛠 Tecnologías

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 19, Vite, React Router, FullCalendar, react-toastify |
| **Backend** | Node.js, Express 5, JWT, bcryptjs |
| **Base de datos** | MySQL 8.0+ |
| **Control de versiones** | Git + GitHub |

---

## 📁 Estructura del proyecto

```
hotel-app/
└── backend-hotel/
    ├── backend-hotel/        ← Backend (API REST en Node.js + Express)
    │   ├── config/           ← Configuración de conexión a la BD
    │   ├── controllers/      ← Lógica de negocio (auth, habitaciones, reservas)
    │   ├── routes/           ← Definición de endpoints
    │   ├── schema.sql        ← Script para crear la base de datos
    │   ├── seed-usuarios.js  ← Script para insertar usuarios de prueba
    │   ├── index.js          ← Punto de entrada del servidor
    │   ├── package.json
    │   └── .env              ← Variables de entorno (NO se sube a GitHub)
    └── hotel-frontend/       ← Frontend (React + Vite)
        ├── src/
        │   ├── components/   ← Componentes de la UI
        │   ├── App.jsx
        │   └── main.jsx
        └── package.json
```

> **Nota:** la doble carpeta `backend-hotel/backend-hotel/` es un artefacto histórico de la organización inicial del proyecto y se conserva por compatibilidad con los commits anteriores.

---

## ✅ Requisitos previos

Antes de instalar, asegúrate de tener:

1. **Node.js** versión 18 o superior. Verifica con `node --version`.
2. **MySQL** versión 8.0 o superior. Verifica con `mysql --version`.
3. **Git** para clonar el repositorio.
4. Un cliente para administrar MySQL (recomendado: **MySQL Workbench**).

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <URL-DEL-REPOSITORIO>
cd hotel-app
```

### 2. Configurar la base de datos

Esta sección crea la base de datos `hotel` con sus 4 tablas y las 24 habitaciones del hotel.

#### 2.1. Crear el archivo `.env`

Dentro de la carpeta `backend-hotel/backend-hotel/` crea un archivo llamado `.env` con el siguiente contenido (ajusta los valores a tu instalación local de MySQL):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=hotel
DB_PORT=3306
JWT_SECRET=cambia_esto_por_una_cadena_larga_y_aleatoria
```

> **Importante:** este archivo nunca se sube a GitHub (está en `.gitignore`). Cada desarrollador debe crear el suyo.

#### 2.2. Ejecutar el schema

Tienes dos opciones:

**Opción A — Por terminal:**

```bash
cd backend-hotel/backend-hotel
mysql -u root -p < schema.sql
```

Te pedirá la contraseña de MySQL.

**Opción B — Por MySQL Workbench:**

1. Abre MySQL Workbench y conéctate al servidor local.
2. Ve a `File → Open SQL Script` y selecciona `schema.sql`.
3. Presiona el ícono del rayo ⚡ (o `Ctrl + Shift + Enter`) para ejecutar todo el script.
4. En el panel izquierdo (Schemas), haz click derecho y selecciona **Refresh**. Deberías ver la base de datos `hotel` con las tablas `usuarios`, `habitaciones`, `reservas` y `notificaciones`.

> **¿Qué hace este script?** Borra la base de datos `hotel` si existe, la recrea desde cero con todas las tablas, sus claves foráneas, índices, y carga las 24 habitaciones (8 estándar, 8 suite, 8 familiares). Es **destructivo** — solo úsalo en desarrollo, nunca en producción con datos reales.

### 3. Instalar dependencias y crear usuarios de prueba

#### 3.1. Backend

```bash
cd backend-hotel/backend-hotel
npm install
node seed-usuarios.js
```

El script `seed-usuarios.js` inserta 4 usuarios de prueba (admin, recepcionista y dos huéspedes) con sus contraseñas correctamente hasheadas usando **bcrypt**. Si todo va bien, verás en consola una tabla con las credenciales.

> **¿Por qué un script aparte y no SQL directo?** Las contraseñas en la base de datos no se guardan en texto plano (eso sería un problema grave de seguridad), sino como **hashes bcrypt** que se generan ejecutando código Node. Por eso los usuarios se crean con el script en lugar de un `INSERT` directo.

#### 3.2. Frontend

En otra terminal:

```bash
cd backend-hotel/hotel-frontend
npm install
```

---

## ▶️ Cómo ejecutar el proyecto

Necesitas dos terminales abiertas simultáneamente.

### Terminal 1 — Backend

```bash
cd backend-hotel/backend-hotel
node index.js
```

El servidor arranca en **http://localhost:3000**. Verás en consola la lista de endpoints disponibles y un mensaje de "🔥 Conectado a MySQL".

### Terminal 2 — Frontend

```bash
cd backend-hotel/hotel-frontend
npm run dev
```

Vite arranca en **http://localhost:5173** (la URL exacta aparece en consola). Abre esa dirección en tu navegador.

---

## 🔐 Credenciales de prueba

Después de ejecutar `seed-usuarios.js`, puedes iniciar sesión con cualquiera de estas cuentas. **Todas usan la contraseña `password123`.**

| Rol | Correo | Acceso a |
|---|---|---|
| Administrador | `admin@hotelcancun.com` | Panel administrativo, reportes, todas las reservas |
| Recepcionista | `recepcion@hotelcancun.com` | Panel de check-in y check-out |
| Huésped | `andres@test.com` | Búsqueda y reservas |
| Huésped | `juan@test.com` | Búsqueda y reservas |

> Si necesitas resetear los usuarios de prueba, vuelve a correr `node seed-usuarios.js`. El script borra los usuarios con esos correos antes de insertarlos de nuevo, así que es seguro ejecutarlo varias veces.

---

## 👥 Equipo

| Integrante | Rol | Contacto |
|---|---|---|
| **Juan Esteban Rojas Valles** | Analista, diseñador y programador | jrojasv10@ucentral.edu.co |
| **Andrés Felipe Rey González** | Programador y diseñador | areyg1@ucentral.edu.co |

---

## 📚 Documentación adicional

- **Especificación de Requisitos (IEEE 830):** `docs/IEEE830.pdf`
- **Plan de Pruebas (ISO/IEC/IEEE 29119):** `docs/PlanDePruebas.pdf` *(en elaboración — Sprint 4)*
- **Historias de usuario:** [Google Docs](https://docs.google.com/document/d/161rbqLbpa2s3nm04dKWwjRzrNb_neSPnhpUiUGccoN4/edit?usp=sharing)
- **Mockups:** [Google Drive](https://drive.google.com/file/d/1P67VVAP7Tnsx3LMOR3PTiiXXuUFlPG6Q/view?usp=drive_link)

---

## 📝 Licencia

Proyecto académico — Universidad Central, Facultad de Ingeniería y Ciencias Básicas, Programa de Ingeniería de Sistemas, 2026-1S.
