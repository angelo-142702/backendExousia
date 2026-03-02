const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ==================== USUARIO ====================
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'editor', 'lector'), defaultValue: 'lector' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  ultimo_acceso: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'usuarios', timestamps: true, createdAt: 'created_at', updatedAt: false });

// ==================== TOKEN ====================
const Token = sequelize.define('Token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  token: { type: DataTypes.STRING(500), allowNull: false },
  tipo: { type: DataTypes.ENUM('access', 'refresh'), allowNull: false },
  expira_en: { type: DataTypes.DATE, allowNull: false },
  revocado: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'tokens', timestamps: false });

// ==================== CATEGORÍA PRINCIPAL ====================
const CategoriaPrincipal = sequelize.define('CategoriaPrincipal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  icono: { type: DataTypes.STRING(50) },
  color: { type: DataTypes.STRING(50) },
  descripcion: { type: DataTypes.TEXT },
  orden: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'categorias_principales', timestamps: false });

// ==================== SUBCATEGORÍA ====================
const Subcategoria = sequelize.define('Subcategoria', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  categoria_id: { type: DataTypes.INTEGER },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
}, { tableName: 'subcategorias', timestamps: false });

// ==================== EMOCIÓN ====================
const Emocion = sequelize.define('Emocion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false },
}, { tableName: 'emociones', timestamps: false });

// ==================== ÁREA DE VIDA ====================
const AreaVida = sequelize.define('AreaVida', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false },
}, { tableName: 'areas_vida', timestamps: false });

// ==================== PALABRA ====================
const Palabra = sequelize.define('Palabra', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_texto: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  titulo_principal: { type: DataTypes.STRING(255) },
  versiculo_cita: { type: DataTypes.STRING(100), allowNull: false },
  versiculo_texto: { type: DataTypes.TEXT, allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  autor: { type: DataTypes.STRING(100), defaultValue: 'Nuestro Apóstol' },
  ministerio: { type: DataTypes.STRING(100), defaultValue: 'Casa Gobierno Exousia' },
  visitas: { type: DataTypes.INTEGER, defaultValue: 0 },
  compartidos: { type: DataTypes.INTEGER, defaultValue: 0 },
  guardados: { type: DataTypes.INTEGER, defaultValue: 0 },
  publicado: { type: DataTypes.BOOLEAN, defaultValue: true },
  destacado: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'palabras', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ==================== APLICACIÓN PRÁCTICA ====================
const AplicacionPractica = sequelize.define('AplicacionPractica', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  palabra_id: { type: DataTypes.INTEGER, allowNull: false },
  texto: { type: DataTypes.TEXT, allowNull: false },
  orden: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'aplicaciones_practicas', timestamps: false });

// ==================== TABLAS PIVOTE (sin modelo explícito) ====================
const PalabraEmocion = sequelize.define('PalabraEmocion', {}, {
  tableName: 'palabra_emociones', timestamps: false
});
const PalabraAreaVida = sequelize.define('PalabraAreaVida', {}, {
  tableName: 'palabra_areas_vida', timestamps: false
});
const PalabraSubcategoria = sequelize.define('PalabraSubcategoria', {}, {
  tableName: 'palabra_subcategorias', timestamps: false
});

// ==================== ASOCIACIONES ====================
// Usuario -> Token
Usuario.hasMany(Token, { foreignKey: 'usuario_id', as: 'tokens' });
Token.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Categoría -> Subcategoría
CategoriaPrincipal.hasMany(Subcategoria, { foreignKey: 'categoria_id', as: 'subcategorias' });
Subcategoria.belongsTo(CategoriaPrincipal, { foreignKey: 'categoria_id', as: 'categoria' });

// Palabra -> AplicacionPractica
Palabra.hasMany(AplicacionPractica, { foreignKey: 'palabra_id', as: 'aplicaciones', onDelete: 'CASCADE' });
AplicacionPractica.belongsTo(Palabra, { foreignKey: 'palabra_id', as: 'palabra' });

// Palabra <-> Emociones (M:M)
Palabra.belongsToMany(Emocion, { through: PalabraEmocion, foreignKey: 'palabra_id', otherKey: 'emocion_id', as: 'emociones' });
Emocion.belongsToMany(Palabra, { through: PalabraEmocion, foreignKey: 'emocion_id', otherKey: 'palabra_id', as: 'palabras' });

// Palabra <-> AreasVida (M:M)
Palabra.belongsToMany(AreaVida, { through: PalabraAreaVida, foreignKey: 'palabra_id', otherKey: 'area_vida_id', as: 'areasVida' });
AreaVida.belongsToMany(Palabra, { through: PalabraAreaVida, foreignKey: 'area_vida_id', otherKey: 'palabra_id', as: 'palabras' });

// Palabra <-> Subcategorias (M:M)
Palabra.belongsToMany(Subcategoria, { through: PalabraSubcategoria, foreignKey: 'palabra_id', otherKey: 'subcategoria_id', as: 'subcategorias' });
Subcategoria.belongsToMany(Palabra, { through: PalabraSubcategoria, foreignKey: 'subcategoria_id', otherKey: 'palabra_id', as: 'palabras' });

// Usuario -> Palabra
Usuario.hasMany(Palabra, { foreignKey: 'created_by', as: 'palabras' });
Palabra.belongsTo(Usuario, { foreignKey: 'created_by', as: 'creador' });

module.exports = {
  sequelize,
  Usuario,
  Token,
  CategoriaPrincipal,
  Subcategoria,
  Emocion,
  AreaVida,
  Palabra,
  AplicacionPractica,
  PalabraEmocion,
  PalabraAreaVida,
  PalabraSubcategoria,
};
