const express = require('express');
const router = express.Router();

import { list } from '../controllers/collectionsController.js';

router.get('/collections', list);
// create
router.post('/blog', requireSignin, authMiddleware, create);
// read
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
// search related
router.get('/blogs/search', listSearch);
router.post('/blogs/advanced-search', requireSignin, adminMiddleware, advancedSearch);
router.get('/:username/blogs', listByUser);
// update
router.put('/blog/:slug/add-clap', addClap);
router.put('/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, update);
// delete
router.delete('/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, remove);

module.exports = router;