const { Op } = require('sequelize');
const {
  Palabra, AplicacionPractica, Emocion, AreaVida, Subcategoria, CategoriaPrincipal
} = require('../models');

const palabraIncludes = [
  { model: AplicacionPractica, as: 'aplicaciones', separate: true, order: [['orden', 'ASC']] },
  { model: Emocion, as: 'emociones', attributes: ['id', 'nombre'], through: { attributes: [] } },
  { model: AreaVida, as: 'areasVida', attributes: ['id', 'nombre'], through: { attributes: [] } },
  {
    model: Subcategoria, as: 'subcategorias', attributes: ['id', 'nombre'],
    through: { attributes: [] },
    include: [{ model: CategoriaPrincipal, as: 'categoria', attributes: ['id', 'nombre', 'icono', 'color'] }]
  },
];

// PUBLIC: Get all published palabras
exports.getPublic = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, categoria, subcategoria, emocion, area, destacado } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { publicado: true };

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { titulo_principal: { [Op.like]: `%${search}%` } },
        { mensaje: { [Op.like]: `%${search}%` } },
        { versiculo_texto: { [Op.like]: `%${search}%` } },
      ];
    }
    if (destacado === 'true') where.destacado = true;

    let include = [...palabraIncludes];

    // Filter by subcategoria
    if (subcategoria) {
      include = include.map(inc => {
        if (inc.as === 'subcategorias') {
          return { ...inc, where: { id: subcategoria }, required: true };
        }
        return inc;
      });
    }
    // Filter by emocion
    if (emocion) {
      include = include.map(inc => {
        if (inc.as === 'emociones') {
          return { ...inc, where: { id: emocion }, required: true };
        }
        return inc;
      });
    }
    // Filter by area de vida
    if (area) {
      include = include.map(inc => {
        if (inc.as === 'areasVida') {
          return { ...inc, where: { id: area }, required: true };
        }
        return inc;
      });
    }

    const { count, rows } = await Palabra.findAndCountAll({
      where,
      include,
      order: [['fecha', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getPublic:', error);
    res.status(500).json({ success: false, message: 'Error al obtener palabras' });
  }
};

// PUBLIC: Get single palabra and increment visitas
exports.getByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const palabra = await Palabra.findOne({
      where: { id, publicado: true },
      include: palabraIncludes
    });

    if (!palabra) {
      return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
    }

    await palabra.increment('visitas');

    res.json({ success: true, data: palabra });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la palabra' });
  }
};

// PUBLIC: Get latest palabra
exports.getLatest = async (req, res) => {
  try {
    const palabra = await Palabra.findOne({
      where: { publicado: true },
      include: palabraIncludes,
      order: [['fecha', 'DESC']]
    });
    res.json({ success: true, data: palabra });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la última palabra' });
  }
};

// ADMIN: Get all palabras (including unpublished)
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, publicado } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { titulo_principal: { [Op.like]: `%${search}%` } },
      ];
    }
    if (publicado !== undefined) where.publicado = publicado === 'true';

    const { count, rows } = await Palabra.findAndCountAll({
      where,
      include: palabraIncludes,
      order: [['fecha', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener palabras' });
  }
};

// ADMIN: Get single palabra
exports.getById = async (req, res) => {
  try {
    const palabra = await Palabra.findByPk(req.params.id, { include: palabraIncludes });
    if (!palabra) return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
    res.json({ success: true, data: palabra });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la palabra' });
  }
};

// ADMIN: Create palabra
exports.create = async (req, res) => {
  try {
    const {
      fecha, fecha_texto, titulo, titulo_principal, versiculo_cita, versiculo_texto,
      mensaje, autor, ministerio, publicado, destacado,
      aplicaciones, emociones, areasVida, subcategorias
    } = req.body;

    const palabra = await Palabra.create({
      fecha, fecha_texto, titulo, titulo_principal, versiculo_cita, versiculo_texto,
      mensaje, autor, ministerio, publicado, destacado,
      created_by: req.user.id
    });

    if (aplicaciones?.length) {
      await AplicacionPractica.bulkCreate(
        aplicaciones.map((a, i) => ({ ...a, palabra_id: palabra.id, orden: a.orden ?? i }))
      );
    }
    if (emociones?.length) await palabra.setEmociones(emociones);
    if (areasVida?.length) await palabra.setAreasVida(areasVida);
    if (subcategorias?.length) await palabra.setSubcategorias(subcategorias);

    const palabraCompleta = await Palabra.findByPk(palabra.id, { include: palabraIncludes });
    res.status(201).json({ success: true, message: 'Palabra creada exitosamente', data: palabraCompleta });
  } catch (error) {
    console.error('Error create palabra:', error);
    res.status(500).json({ success: false, message: 'Error al crear la palabra' });
  }
};

// ADMIN: Update palabra
exports.update = async (req, res) => {
  try {
    const palabra = await Palabra.findByPk(req.params.id);
    if (!palabra) return res.status(404).json({ success: false, message: 'Palabra no encontrada' });

    const {
      fecha, fecha_texto, titulo, titulo_principal, versiculo_cita, versiculo_texto,
      mensaje, autor, ministerio, publicado, destacado,
      aplicaciones, emociones, areasVida, subcategorias
    } = req.body;

    await palabra.update({
      fecha, fecha_texto, titulo, titulo_principal, versiculo_cita, versiculo_texto,
      mensaje, autor, ministerio, publicado, destacado
    });

    if (aplicaciones !== undefined) {
      await AplicacionPractica.destroy({ where: { palabra_id: palabra.id } });
      if (aplicaciones.length) {
        await AplicacionPractica.bulkCreate(
          aplicaciones.map((a, i) => ({ ...a, palabra_id: palabra.id, orden: a.orden ?? i }))
        );
      }
    }
    if (emociones !== undefined) await palabra.setEmociones(emociones);
    if (areasVida !== undefined) await palabra.setAreasVida(areasVida);
    if (subcategorias !== undefined) await palabra.setSubcategorias(subcategorias);

    const palabraCompleta = await Palabra.findByPk(palabra.id, { include: palabraIncludes });
    res.json({ success: true, message: 'Palabra actualizada exitosamente', data: palabraCompleta });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la palabra' });
  }
};

// ADMIN: Delete palabra
exports.delete = async (req, res) => {
  try {
    const palabra = await Palabra.findByPk(req.params.id);
    if (!palabra) return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
    await palabra.destroy();
    res.json({ success: true, message: 'Palabra eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la palabra' });
  }
};

// PUBLIC: Stats
exports.stats = async (req, res) => {
  try {
    const total = await Palabra.count({ where: { publicado: true } });
    const totalVisitas = await Palabra.sum('visitas', { where: { publicado: true } });
    res.json({ success: true, data: { total, totalVisitas: totalVisitas || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};
