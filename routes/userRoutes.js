const { Router } = require('express');
const userController = require('../controllers/userController')

const router = Router();

router.post('/addFriend', userController.addFriend);
router.get('/getFriends', userController.getFriends);

module.exports = router;