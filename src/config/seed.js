require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./database');
const {
  Usuario, CategoriaPrincipal, Subcategoria, Emocion, AreaVida, Palabra, AplicacionPractica
} = require('../models');

async function seed() {
  try {
    console.log('🌱 Iniciando seed de datos...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // Crear admin
    const adminExists = await Usuario.findOne({ where: { email: 'admin@exousia.com' } });
    if (!adminExists) {
      const hash = await bcrypt.hash('Admin123!', 12);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@exousia.com',
        password_hash: hash,
        rol: 'admin',
        activo: true
      });
      console.log('✅ Admin creado: admin@exousia.com / Admin123!');
    }

    // Crear categorías principales
    const categoriasData = [
      { nombre: 'Fe y Esperanza', icono: '✨', color: '#C9A227', descripcion: 'Palabras para fortalecer la fe', orden: 1 },
      { nombre: 'Sanidad y Restauración', icono: '🕊️', color: '#4A90D9', descripcion: 'Palabras de sanidad espiritual y emocional', orden: 2 },
      { nombre: 'Propósito y Destino', icono: '🎯', color: '#8B5CF6', descripcion: 'Palabras sobre llamado y propósito divino', orden: 3 },
      { nombre: 'Familia y Relaciones', icono: '❤️', color: '#E84393', descripcion: 'Palabras para el hogar y las relaciones', orden: 4 },
      { nombre: 'Provisión y Abundancia', icono: '🌿', color: '#10B981', descripcion: 'Palabras de prosperidad y provisión divina', orden: 5 },
      { nombre: 'Guerra Espiritual', icono: '⚔️', color: '#EF4444', descripcion: 'Palabras para la batalla espiritual', orden: 6 },
      { nombre: 'Gratitud y Alabanza', icono: '🙏', color: '#F59E0B', descripcion: 'Palabras de adoración y gratitud', orden: 7 },
    ];

    for (const cat of categoriasData) {
      await CategoriaPrincipal.findOrCreate({ where: { nombre: cat.nombre }, defaults: cat });
    }
    console.log('✅ Categorías creadas');

    // Crear subcategorías
    const cats = await CategoriaPrincipal.findAll();
    const catMap = {};
    cats.forEach(c => { catMap[c.nombre] = c.id; });

    const subCategoriasData = [
      { categoria_id: catMap['Fe y Esperanza'], nombre: 'Tiempos de Incertidumbre' },
      { categoria_id: catMap['Fe y Esperanza'], nombre: 'Promesas de Dios' },
      { categoria_id: catMap['Fe y Esperanza'], nombre: 'Renovación de la Fe' },
      { categoria_id: catMap['Sanidad y Restauración'], nombre: 'Sanidad Emocional' },
      { categoria_id: catMap['Sanidad y Restauración'], nombre: 'Duelo y Pérdida' },
      { categoria_id: catMap['Sanidad y Restauración'], nombre: 'Sanidad Física' },
      { categoria_id: catMap['Propósito y Destino'], nombre: 'Descubriendo el Llamado' },
      { categoria_id: catMap['Propósito y Destino'], nombre: 'Nuevos Comienzos' },
      { categoria_id: catMap['Familia y Relaciones'], nombre: 'Matrimonio' },
      { categoria_id: catMap['Familia y Relaciones'], nombre: 'Hijos y Familia' },
      { categoria_id: catMap['Provisión y Abundancia'], nombre: 'Crisis Financiera' },
      { categoria_id: catMap['Guerra Espiritual'], nombre: 'Liberación y Victoria' },
      { categoria_id: catMap['Gratitud y Alabanza'], nombre: 'Celebración Diaria' },
    ];

    for (const sub of subCategoriasData) {
      await Subcategoria.findOrCreate({ where: { nombre: sub.nombre, categoria_id: sub.categoria_id }, defaults: sub });
    }
    console.log('✅ Subcategorías creadas');

    // Crear emociones
    const emocionesList = [
      'Ansioso', 'Temeroso', 'Esperanzado', 'Agradecido', 'Triste', 'Cansado',
      'Confundido', 'Alegre', 'Enojado', 'Solitario', 'En paz', 'Angustiado'
    ];
    for (const e of emocionesList) {
      await Emocion.findOrCreate({ where: { nombre: e } });
    }
    console.log('✅ Emociones creadas');

    // Crear áreas de vida
    const areasList = [
      'Salud', 'Finanzas', 'Familia', 'Trabajo', 'Ministerio',
      'Emociones', 'Relaciones', 'Identidad', 'Propósito', 'Fe'
    ];
    for (const a of areasList) {
      await AreaVida.findOrCreate({ where: { nombre: a } });
    }
    console.log('✅ Áreas de vida creadas');

    // Crear palabra de ejemplo
    const palabraExiste = await Palabra.findOne({ where: { titulo: 'Mi herencia espiritual de Hoy' } });
    if (!palabraExiste) {
      const admin = await Usuario.findOne({ where: { email: 'admin@exousia.com' } });
      const palabra = await Palabra.create({
        fecha: new Date('2026-02-12'),
        fecha_texto: 'Jueves 12 de febrero de 2026',
        titulo: 'Mi herencia espiritual de Hoy',
        titulo_principal: '¡Este es el día, alégrate!',
        versiculo_cita: 'Salmo 118:24',
        versiculo_texto: 'Este es el día que hizo el Señor; regocijémonos y alegrémonos en él.',
        mensaje: `Hoy, el Señor te llama a celebrar Su presencia en medio de todos tus momentos. No importa qué circunstancias rodeen tu vida: dificultades, incertidumbre, o incluso la rutina de cada día. Dios ha destinado este día específicamente para que lo vivas con plenitud y con la consciencia de Su amor inagotable.\n\nRecuerda que la gratitud no es solo para los días buenos; es una disciplina espiritual que transforma nuestro corazón y nuestra perspectiva. Cuando eliges regocijarte en el Señor, estás ejerciendo una fe activa que dice: "Confío en Dios incluso cuando no entiendo todo."\n\nHoy es un día de victoria espiritual. Reclámalo con fe y avanza sabiendo que Dios camina contigo en cada paso.`,
        autor: 'Nuestro Apóstol',
        ministerio: 'Casa Gobierno Exousia',
        publicado: true,
        destacado: true,
        created_by: admin.id
      });

      await AplicacionPractica.bulkCreate([
        { palabra_id: palabra.id, texto: 'Cultiva la gratitud diaria: Comienza y termina tu día dando gracias a Dios por al menos tres bendiciones concretas.', orden: 1 },
        { palabra_id: palabra.id, texto: 'Enfrenta los desafíos con fe: Cuando surjan problemas, en lugar de preocuparte, declara en voz alta: "Dios está conmigo y tiene el control."', orden: 2 },
        { palabra_id: palabra.id, texto: 'Comparte con amor: Busca a alguien hoy a quien puedas animarle con una palabra de esperanza o un acto de bondad.', orden: 3 },
        { palabra_id: palabra.id, texto: 'Medita en la Palabra: Dedica al menos 10 minutos a leer y reflexionar sobre las Escrituras, permitiendo que alimenten tu espíritu.', orden: 4 },
      ]);

      // Asociar emociones
      const emociones = await Emocion.findAll({ where: { nombre: ['Ansioso', 'Cansado', 'Esperanzado'] } });
      await palabra.addEmociones(emociones);

      // Asociar áreas de vida
      const areas = await AreaVida.findAll({ where: { nombre: ['Fe', 'Emociones', 'Propósito'] } });
      await palabra.addAreasVida(areas);

      // Asociar subcategorías
      const subcats = await Subcategoria.findAll({ where: { nombre: ['Tiempos de Incertidumbre', 'Celebración Diaria'] } });
      await palabra.addSubcategorias(subcats);

      console.log('✅ Palabra de ejemplo creada');
    }

    console.log('\n🎉 Seed completado exitosamente.');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email: admin@exousia.com');
    console.log('   Password: Admin123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
