const { Router } = require('express');
const postController = require('../controllers/postController')

const router = Router();

router.get('/getPosts', postController.getPosts);
router.get('/getOwnPosts', postController.getOwnPosts);
router.post('/addPost', postController.addPost);

module.exports = router;