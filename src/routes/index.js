const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const palabrasCtrl = require('../controllers/palabras.controller');
const categoriasCtrl = require('../controllers/categorias.controller');
const taxonomiasCtrl = require('../controllers/taxonomias.controller');
const { authenticateToken, requireAdmin, requireEditor } = require('../middleware/auth');

// ===== AUTH =====
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', authenticateToken, authCtrl.me);

// ===== PALABRAS - PUBLIC =====
router.get('/palabras', palabrasCtrl.getPublic);
router.get('/palabras/latest', palabrasCtrl.getLatest);
router.get('/palabras/stats', palabrasCtrl.stats);
router.get('/palabras/:id', palabrasCtrl.getByIdPublic);

// ===== PALABRAS - ADMIN =====
router.get('/admin/palabras', authenticateToken, requireEditor, palabrasCtrl.getAll);
router.get('/admin/palabras/:id', authenticateToken, requireEditor, palabrasCtrl.getById);
router.post('/admin/palabras', authenticateToken, requireEditor, palabrasCtrl.create);
router.put('/admin/palabras/:id', authenticateToken, requireEditor, palabrasCtrl.update);
router.delete('/admin/palabras/:id', authenticateToken, requireAdmin, palabrasCtrl.delete);

// ===== CATEGORÍAS - PUBLIC =====
router.get('/categorias', categoriasCtrl.getAll);
router.get('/categorias/:id', categoriasCtrl.getById);

// ===== CATEGORÍAS - ADMIN =====
router.post('/admin/categorias', authenticateToken, requireAdmin, categoriasCtrl.create);
router.put('/admin/categorias/:id', authenticateToken, requireAdmin, categoriasCtrl.update);
router.delete('/admin/categorias/:id', authenticateToken, requireAdmin, categoriasCtrl.delete);
router.post('/admin/categorias/:id/subcategorias', authenticateToken, requireAdmin, categoriasCtrl.createSub);
router.put('/admin/subcategorias/:subId', authenticateToken, requireAdmin, categoriasCtrl.updateSub);
router.delete('/admin/subcategorias/:subId', authenticateToken, requireAdmin, categoriasCtrl.deleteSub);

// ===== EMOCIONES =====
router.get('/emociones', taxonomiasCtrl.getAllEmociones);
router.post('/admin/emociones', authenticateToken, requireAdmin, taxonomiasCtrl.createEmocion);
router.delete('/admin/emociones/:id', authenticateToken, requireAdmin, taxonomiasCtrl.deleteEmocion);

// ===== ÁREAS DE VIDA =====
router.get('/areas-vida', taxonomiasCtrl.getAllAreas);
router.post('/admin/areas-vida', authenticateToken, requireAdmin, taxonomiasCtrl.createArea);
router.delete('/admin/areas-vida/:id', authenticateToken, requireAdmin, taxonomiasCtrl.deleteArea);

module.exports = router;
