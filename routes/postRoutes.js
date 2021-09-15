const { Router } = require('express');
const postController = require('../controllers/postController')

const router = Router();

router.get('/get-posts', postController.getPosts);
router.post('/add-post', postController.addPost);

module.exports = router;