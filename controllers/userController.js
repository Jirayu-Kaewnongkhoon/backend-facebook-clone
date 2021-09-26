const { Types } = require('mongoose');
const User = require("../models/user")
const jwt = require('jsonwebtoken');

const getUserID = (token) => {
    // decode jwt ที่แนบมากับ cookie เพื่อดึงเอา userID
    const decoded = jwt.decode(token, { complete: true });
    return decoded.payload.id
}


module.exports.getUser = (req, res) => {

}

module.exports.addFriend = async (req, res) => {
    const { friend } = req.body;
    const id = getUserID(req.cookies.jwt);

    try {
        // TODO: เรา add เขา เขาก็ต้องมีเราด้วย
        const result = await User.findByIdAndUpdate(
            id,
            { '$push': { 'friends': Types.ObjectId(friend) } }
        );
        
        res.status(200).json({ data: result });
    } catch (error) {
        console.log(error);
    }
    
}

module.exports.getFriends = async (req, res) => {
    const id = getUserID(req.cookies.jwt);
    
    try {
        const user = await User.findOne({ _id: id });

        const friends = await User.find(
            { _id: { $in: user.friends }},
            { username: 1 },
        );

        res.status(200).json({ data: friends });
        
    } catch (error) {
        console.log(error);
    }
}