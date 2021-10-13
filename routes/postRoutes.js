const { Router } = require('express');
const postController = require('../controllers/postController')

const router = Router();

router.get('/getPosts', postController.getPosts);
router.post('/addPost', postController.addPost);

module.exports = router;