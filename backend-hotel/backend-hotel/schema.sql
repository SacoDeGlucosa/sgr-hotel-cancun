-- =====================================================================
-- Sistema de Gestión de Reservas - Hotel Cancún Resort & Spa
-- Schema de base de datos MySQL
-- =====================================================================
-- Este script crea la base de datos completa desde cero.
-- Para usarlo: mysql -u root -p < schema.sql
-- =====================================================================

DROP DATABASE IF EXISTS hotel;
CREATE DATABASE hotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel;

-- =====================================================================
-- Tabla: usuarios
-- Almacena huéspedes, recepcionistas y administradores (RF-01, RF-02)
-- =====================================================================
CREATE TABLE usuarios (
    id_usuario       INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    correo           VARCHAR(150) NOT NULL UNIQUE,
    fecha_nacimiento DATE NULL,
    contraseña       VARCHAR(255) NOT NULL,  -- hash bcrypt (60 chars + margen)
    rol              ENUM('huesped', 'recepcionista', 'administrador') NOT NULL DEFAULT 'huesped',
    verificado       BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso    TIMESTAMP NULL,
    INDEX idx_correo (correo),
    INDEX idx_rol (rol)
) ENGINE=InnoDB;

-- =====================================================================
-- Tabla: habitaciones
-- 24 habitaciones del hotel boutique (RF-03, RF-09)
-- =====================================================================
CREATE TABLE habitaciones (
    id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
    numero        VARCHAR(10) NOT NULL UNIQUE,
    tipo          ENUM('estandar', 'suite', 'familiar') NOT NULL,
    precio        DECIMAL(10, 2) NOT NULL,
    descripcion   TEXT,
    estado        ENUM('libre', 'reservada', 'ocupada', 'mantenimiento') NOT NULL DEFAULT 'libre',
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    CONSTRAINT chk_precio CHECK (precio > 0)
) ENGINE=InnoDB;

-- =====================================================================
-- Tabla: reservas
-- Registra todas las reservas (RF-04, RF-05, RF-06, RF-07, RF-08)
-- =====================================================================
CREATE TABLE reservas (
    id_reserva       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    id_habitacion    INT NOT NULL,
    fecha_inicio     DATE NOT NULL,
    fecha_fin        DATE NOT NULL,
    estado           ENUM('confirmada', 'ocupada', 'finalizada', 'cancelada') NOT NULL DEFAULT 'confirmada',
    costo_total      DECIMAL(10, 2) NULL,
    total_pagado     DECIMAL(10, 2) NULL,         -- se llena en el check-out (RF-08)
    penalizacion     DECIMAL(10, 2) NULL,         -- aplicada en cancelación (RF-06)
    monto_reembolso  DECIMAL(10, 2) NULL,         -- reembolso al huésped tras cancelación (RF-06)
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_checkin    TIMESTAMP NULL,              -- registrada en RF-07
    fecha_checkout   TIMESTAMP NULL,              -- registrada en RF-08
    fecha_cancelacion TIMESTAMP NULL,             -- registrada en RF-06
    FOREIGN KEY (id_usuario)    REFERENCES usuarios(id_usuario)       ON DELETE RESTRICT,
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion) ON DELETE RESTRICT,
    INDEX idx_usuario (id_usuario),
    INDEX idx_habitacion (id_habitacion),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio)
) ENGINE=InnoDB;

-- =====================================================================
-- Tabla: notificaciones (RF-11)
-- =====================================================================
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_reserva      INT NULL,
    tipo_evento     ENUM('reserva_creada', 'reserva_modificada', 'reserva_cancelada',
                         'checkin', 'checkout', 'recordatorio') NOT NULL,
    asunto          VARCHAR(200),
    mensaje         TEXT,
    fecha_envio     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviado_ok      BOOLEAN NOT NULL DEFAULT FALSE,
    error_mensaje   TEXT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)  ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_evento (tipo_evento)
) ENGINE=InnoDB;

-- =====================================================================
-- DATOS INICIALES (SEED)
-- =====================================================================
-- NOTA: Los usuarios de prueba se crean con el script seed-usuarios.js
-- (que usa bcrypt para hashear las contraseñas correctamente).
-- Aquí solo se insertan datos no sensibles.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 24 habitaciones del hotel boutique (8 de cada tipo)
-- Precios en COP (pesos colombianos) acordes al contexto del proyecto
-- ---------------------------------------------------------------------
INSERT INTO habitaciones (numero, tipo, precio, descripcion, estado) VALUES
-- Estándar (8): pisos 1-2, números 101-108
('101', 'estandar', 150000.00, 'Habitación estándar con vista interior, 1 cama king',          'libre'),
('102', 'estandar', 150000.00, 'Habitación estándar con vista interior, 2 camas twin',         'libre'),
('103', 'estandar', 160000.00, 'Habitación estándar con vista al jardín, 1 cama king',         'libre'),
('104', 'estandar', 160000.00, 'Habitación estándar con vista al jardín, 2 camas twin',        'libre'),
('201', 'estandar', 170000.00, 'Habitación estándar segundo piso, 1 cama king',                'libre'),
('202', 'estandar', 170000.00, 'Habitación estándar segundo piso, 2 camas twin',               'libre'),
('203', 'estandar', 180000.00, 'Habitación estándar segundo piso vista jardín, 1 cama king',   'libre'),
('204', 'estandar', 180000.00, 'Habitación estándar segundo piso vista jardín, 2 camas twin',  'libre'),

-- Suite (8): pisos 3-4, números 301-308
('301', 'suite',    220000.00, 'Suite con jacuzzi, vista al mar, cama king + sofá cama',       'libre'),
('302', 'suite',    220000.00, 'Suite con jacuzzi, vista al mar, cama king + sofá cama',       'libre'),
('303', 'suite',    240000.00, 'Suite premium con balcón privado y vista al mar',              'libre'),
('304', 'suite',    240000.00, 'Suite premium con balcón privado y vista al mar',              'libre'),
('401', 'suite',    260000.00, 'Suite ejecutiva piso superior, sala de estar separada',        'libre'),
('402', 'suite',    260000.00, 'Suite ejecutiva piso superior, sala de estar separada',        'libre'),
('403', 'suite',    280000.00, 'Suite presidencial junior con terraza',                        'libre'),
('404', 'suite',    280000.00, 'Suite presidencial junior con terraza',                        'libre'),

-- Familiar (8): pisos 5, números 501-508
('501', 'familiar', 250000.00, 'Habitación familiar 2 ambientes, 2 camas king + 2 junior',     'libre'),
('502', 'familiar', 250000.00, 'Habitación familiar 2 ambientes, 2 camas king + 2 junior',     'libre'),
('503', 'familiar', 260000.00, 'Familiar con vista al mar, 2 camas king + 2 junior',           'libre'),
('504', 'familiar', 260000.00, 'Familiar con vista al mar, 2 camas king + 2 junior',           'libre'),
('505', 'familiar', 270000.00, 'Familiar premium piso superior, 2 ambientes conectados',       'libre'),
('506', 'familiar', 270000.00, 'Familiar premium piso superior, 2 ambientes conectados',       'libre'),
('507', 'familiar', 290000.00, 'Familiar deluxe con cocina pequeña y sala',                    'libre'),
('508', 'familiar', 290000.00, 'Familiar deluxe con cocina pequeña y sala',                    'libre');

-- =====================================================================
-- Verificación: cuenta final
-- =====================================================================
SELECT 'Usuarios creados:'    AS info, COUNT(*) AS total FROM usuarios
UNION ALL
SELECT 'Habitaciones creadas:', COUNT(*) FROM habitaciones
UNION ALL
SELECT 'Reservas creadas:',     COUNT(*) FROM reservas;
