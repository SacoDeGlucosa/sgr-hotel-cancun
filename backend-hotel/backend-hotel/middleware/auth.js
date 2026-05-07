const jwt = require('jsonwebtoken');

/**
 * verifyToken
 * Verifica que el request traiga un JWT válido en el header Authorization.
 * Si es válido, adjunta req.user = { id, nombre, rol } y llama next().
 * Si no, responde 401 o 403.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // El header debe venir como "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido. Acceso no autorizado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, nombre, rol }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { verifyToken };
