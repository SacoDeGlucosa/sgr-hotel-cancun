/**
 * authorizeRoles(...roles)
 * Fábrica de middleware que recibe uno o más roles permitidos.
 * Debe usarse DESPUÉS de verifyToken (que ya cargó req.user).
 *
 * Uso:
 *   router.put('/checkin', verifyToken, authorizeRoles('recepcionista', 'administrador'), checkIn);
 *   router.get('/estadisticas', verifyToken, authorizeRoles('administrador'), getEstadisticas);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}. Tu rol actual: ${req.user.rol}`
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
