const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, Token } = require('../models');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { email: email.toLowerCase() } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Update last access
    await usuario.update({ ultimo_acceso: new Date() });

    const { accessToken, refreshToken } = generateTokens(usuario.id);

    // Save refresh token
    const expRefresh = new Date();
    expRefresh.setDate(expRefresh.getDate() + 7);
    await Token.create({
      usuario_id: usuario.id,
      token: refreshToken,
      tipo: 'refresh',
      expira_en: expRefresh
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        accessToken,
        refreshToken,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token requerido' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokenRecord = await Token.findOne({
      where: { token: refreshToken, tipo: 'refresh', revocado: false }
    });

    if (!tokenRecord || new Date() > tokenRecord.expira_en) {
      return res.status(401).json({ success: false, message: 'Refresh token inválido o expirado' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no autorizado' });
    }

    // Revoke old and create new tokens
    await tokenRecord.update({ revocado: true });
    const tokens = generateTokens(usuario.id);

    const expRefresh = new Date();
    expRefresh.setDate(expRefresh.getDate() + 7);
    await Token.create({
      usuario_id: usuario.id,
      token: tokens.refreshToken,
      tipo: 'refresh',
      expira_en: expRefresh
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await Token.update({ revocado: true }, { where: { token: refreshToken } });
    }
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
  }
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      nombre: req.user.nombre,
      email: req.user.email,
      rol: req.user.rol
    }
  });
};
