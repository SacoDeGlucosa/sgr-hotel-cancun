-- ============================================================================
-- Migración para Sprint 4: agrega columna monto_reembolso a la tabla reservas
-- Necesario para RF-06 (Política de penalización en cancelación).
--
-- Ejecutar UNA SOLA VEZ en MySQL Workbench, en la base de datos `hotel`.
-- ============================================================================

USE hotel;

ALTER TABLE reservas
  ADD COLUMN monto_reembolso DECIMAL(10, 2) NULL AFTER penalizacion;

-- Verificación: deberías ver la nueva columna
DESCRIBE reservas;
