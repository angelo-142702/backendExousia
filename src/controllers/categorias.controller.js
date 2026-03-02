const { CategoriaPrincipal, Subcategoria, Palabra } = require('../models');

// Get all categorias with subcategorias
exports.getAll = async (req, res) => {
  try {
    const categorias = await CategoriaPrincipal.findAll({
      include: [{ model: Subcategoria, as: 'subcategorias' }],
      order: [['orden', 'ASC'], [{ model: Subcategoria, as: 'subcategorias' }, 'nombre', 'ASC']]
    });
    res.json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
};

// Get single categoria with word count
exports.getById = async (req, res) => {
  try {
    const categoria = await CategoriaPrincipal.findByPk(req.params.id, {
      include: [{ model: Subcategoria, as: 'subcategorias' }]
    });
    if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true, data: categoria });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la categoría' });
  }
};

// ADMIN: Create categoria
exports.create = async (req, res) => {
  try {
    const { nombre, icono, color, descripcion, orden } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    const categoria = await CategoriaPrincipal.create({ nombre, icono, color, descripcion, orden });
    res.status(201).json({ success: true, data: categoria });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ success: false, message: 'Error al crear categoría' });
  }
};

// ADMIN: Update categoria
exports.update = async (req, res) => {
  try {
    const categoria = await CategoriaPrincipal.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    const { nombre, icono, color, descripcion, orden } = req.body;
    await categoria.update({ nombre, icono, color, descripcion, orden });
    res.json({ success: true, data: categoria });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
  }
};

// ADMIN: Delete categoria
exports.delete = async (req, res) => {
  try {
    const categoria = await CategoriaPrincipal.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    await categoria.destroy();
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
  }
};

// Subcategorias CRUD
exports.createSub = async (req, res) => {
  try {
    const { nombre, descripcion, categoria_id } = req.body;
    const sub = await Subcategoria.create({ nombre, descripcion, categoria_id });
    res.status(201).json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear subcategoría' });
  }
};

exports.updateSub = async (req, res) => {
  try {
    const sub = await Subcategoria.findByPk(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
    await sub.update(req.body);
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar subcategoría' });
  }
};

exports.deleteSub = async (req, res) => {
  try {
    const sub = await Subcategoria.findByPk(req.params.subId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
    await sub.destroy();
    res.json({ success: true, message: 'Subcategoría eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar subcategoría' });
  }
};
