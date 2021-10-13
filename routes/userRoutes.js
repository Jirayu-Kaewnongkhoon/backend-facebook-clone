const { Router } = require('express');
const userController = require('../controllers/userController')

const router = Router();

router.post('/addFriend', userController.addFriend);
router.post('/acceptRequest', userController.acceptRequest);
router.get('/getFriends', userController.getFriends);
router.get('/getFriendRequests', userController.getFriendRequests);
router.get('/getSuggestionFriends', userController.getSuggestionFriends);

module.exports = router;