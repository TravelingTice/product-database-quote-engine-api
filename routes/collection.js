const express = require('express');
const router = express.Router();

const { list } = require('../controllers/collectionsController.js');

router.get('/collections', list);

module.exports = router;