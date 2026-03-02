const { Emocion, AreaVida } = require('../models');

// EMOCIONES
exports.getAllEmociones = async (req, res) => {
  try {
    const emociones = await Emocion.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: emociones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener emociones' });
  }
};

exports.createEmocion = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    const emocion = await Emocion.create({ nombre });
    res.status(201).json({ success: true, data: emocion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear emoción' });
  }
};

exports.deleteEmocion = async (req, res) => {
  try {
    const emocion = await Emocion.findByPk(req.params.id);
    if (!emocion) return res.status(404).json({ success: false, message: 'Emoción no encontrada' });
    await emocion.destroy();
    res.json({ success: true, message: 'Emoción eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar emoción' });
  }
};

// ÁREAS DE VIDA
exports.getAllAreas = async (req, res) => {
  try {
    const areas = await AreaVida.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener áreas de vida' });
  }
};

exports.createArea = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    const area = await AreaVida.create({ nombre });
    res.status(201).json({ success: true, data: area });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear área' });
  }
};

exports.deleteArea = async (req, res) => {
  try {
    const area = await AreaVida.findByPk(req.params.id);
    if (!area) return res.status(404).json({ success: false, message: 'Área no encontrada' });
    await area.destroy();
    res.json({ success: true, message: 'Área eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar área' });
  }
};
