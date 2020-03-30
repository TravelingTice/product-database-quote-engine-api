const express = require('express');
const router = express.Router();

const { list, read, create, update, remove } = require('../controllers/customersController');
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/authController');

router.get('/customers', list);
router.get('/customers/:slug', read);
router.post('/customers', requireSignin, authMiddleware, create);
router.post('/customers/:slug', requireSignin, authMiddleware, update);
router.delete('/customers/:slug', requireSignin, authMiddleware, remove);

module.exports = router;