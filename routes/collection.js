const express = require('express');
const router = express.Router();

const { list, create, read, remove, update } = require('../controllers/collectionsController.js');

router.get('/collections', list);
router.get('/collections/:slug', read);
router.post('/collections', create);
router.put('/collections/:slug', update);
router.delete('/collections/:slug', remove);

module.exports = router;