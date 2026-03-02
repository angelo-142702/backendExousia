const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'activo']
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no autorizado' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado', expired: true });
    }
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
};

const requireEditor = (req, res, next) => {
  if (!['admin', 'editor'].includes(req.user.rol)) {
    return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de editor o superior' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, requireEditor };
