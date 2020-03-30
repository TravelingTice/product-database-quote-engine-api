const express = require('express');
const router = express.Router();

const { list, read, create, update, remove, listFromUser } = require('../controllers/customersController');
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/authController');

router.get('/customers', list);
router.get('/customers/:id', read);
router.get('/users/:id/customers', listFromUser);
router.post('/customers', requireSignin, authMiddleware, create);
router.put('/customers/:id', requireSignin, authMiddleware, update);
router.delete('/customers/:id', requireSignin, authMiddleware, remove);

module.exports = router;