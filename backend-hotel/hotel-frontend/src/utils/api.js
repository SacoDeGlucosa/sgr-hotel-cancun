/**
 * src/utils/api.js
 *
 * Helper para hacer peticiones HTTP al backend.
 * Adjunta automáticamente el token JWT en el header Authorization
 * y maneja la expiración del token (cierra sesión y redirige al login).
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * apiFetch
 * Hace una petición fetch incluyendo el token JWT del localStorage.
 * Si el backend responde 401 o 403 con token inválido/expirado,
 * limpia la sesión y redirige al login.
 *
 * @param {string} endpoint  Ruta relativa al API_BASE (ej: '/reservas/todas')
 * @param {object} options   Mismas opciones que fetch (method, body, headers...)
 * @returns Response
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Si el token expiró o es inválido, cerramos sesión.
  // 401 = no hay token / token mal formado.
  // 403 con un body que mencione "Token" también lo tratamos como expiración.
  if (response.status === 401) {
    cerrarSesion();
    return response;
  }

  return response;
}

/**
 * Helper para cerrar sesión: limpia localStorage y redirige al login.
 */
export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  // Solo redirigir si no estamos ya en login/registro/inicio
  const path = window.location.pathname;
  if (!['/login', '/registro', '/'].includes(path)) {
    window.location.href = '/login';
  }
}

/**
 * Helper para obtener el usuario actual del localStorage.
 */
export function getUsuarioActual() {
  try {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
