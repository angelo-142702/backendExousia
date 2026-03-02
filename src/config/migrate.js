require('dotenv').config();
const sequelize = require('./database');

// Import all models to register them
require('../models');

async function migrate() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida.');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas correctamente.');
    
    console.log('🎉 Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();
