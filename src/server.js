require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
require('./models'); // register all models and associations

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes. Por favor espere.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos de inicio de sesión. Por favor espere.' }
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);

// ===== ROUTES =====
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EXOUSIA API funcionando', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ===== START SERVER =====
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`\n🚀 EXOUSIA API corriendo en puerto ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}/health`);
      console.log(`📡 API: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
