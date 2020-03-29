const express = require('express');
const router = express.Router();

const { list, read, create, update, remove } = require('../controllers/customersController');

router.get('/customers', list);
router.get('/customers/:slug', read);
router.post('/customers', create);
router.post('/customers/:slug', update);
router.delete('/customers/:slug', remove);

module.exports = router;