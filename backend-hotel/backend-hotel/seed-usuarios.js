/**
 * seed-usuarios.js
 * 
 * Script para insertar usuarios de prueba en la base de datos
 * con contraseñas correctamente hasheadas usando bcrypt.
 * 
 * Uso: node seed-usuarios.js
 * Requisitos: schema.sql ya ejecutado en MySQL
 * 
 * Todos los usuarios de prueba tienen la contraseña: "password123"
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Lista de usuarios de prueba que vamos a crear
const usuariosPrueba = [
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    correo: 'admin@hotelcancun.com',
    fecha_nacimiento: '1985-01-01',
    rol: 'administrador'
  },
  {
    nombre: 'Recepcion',
    apellido: 'Frontdesk',
    correo: 'recepcion@hotelcancun.com',
    fecha_nacimiento: '1990-05-15',
    rol: 'recepcionista'
  },
  {
    nombre: 'Andres',
    apellido: 'Rey',
    correo: 'andres@test.com',
    fecha_nacimiento: '2000-03-10',
    rol: 'huesped'
  },
  {
    nombre: 'Juan Esteban',
    apellido: 'Rojas',
    correo: 'juan@test.com',
    fecha_nacimiento: '2000-07-22',
    rol: 'huesped'
  }
];

const PASSWORD_COMUN = 'password123';

async function seedUsuarios() {
  let conn;
  try {
    // 1. Conectar a la base de datos
    console.log('🔌 Conectando a MySQL...');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    console.log('✅ Conectado.\n');

    // 2. Generar hash bcrypt de la contraseña común
    // El "10" es el cost factor: a mayor número, más lento (y más seguro). 
    // 10 es el estándar recomendado.
    console.log('🔐 Generando hashes bcrypt...');
    const hashedPassword = await bcrypt.hash(PASSWORD_COMUN, 10);
    console.log(`✅ Hash generado (todos usan la contraseña: "${PASSWORD_COMUN}")\n`);

    // 3. Limpiar usuarios existentes con esos correos (por si corres el script varias veces)
    const correos = usuariosPrueba.map(u => u.correo);
    const [resDelete] = await conn.query(
      'DELETE FROM usuarios WHERE correo IN (?)',
      [correos]
    );
    if (resDelete.affectedRows > 0) {
      console.log(`🗑️  Eliminados ${resDelete.affectedRows} usuarios previos con los mismos correos.\n`);
    }

    // 4. Insertar cada usuario
    console.log('👥 Insertando usuarios de prueba:');
    for (const u of usuariosPrueba) {
      await conn.query(
        `INSERT INTO usuarios (nombre, apellido, correo, fecha_nacimiento, contraseña, rol, verificado)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [u.nombre, u.apellido, u.correo, u.fecha_nacimiento, hashedPassword, u.rol]
      );
      console.log(`   ✓ ${u.rol.padEnd(15)} → ${u.correo}`);
    }

    // 5. Mostrar resumen
    console.log('\n✨ Listo. Credenciales para probar:\n');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ ROL              CORREO                       PASSWORD  │');
    console.log('   ├─────────────────────────────────────────────────────────┤');
    for (const u of usuariosPrueba) {
      console.log(`   │ ${u.rol.padEnd(16)} ${u.correo.padEnd(28)} ${PASSWORD_COMUN}  │`);
    }
    console.log('   └─────────────────────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('❌ Error al insertar usuarios:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seedUsuarios();
