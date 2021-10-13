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
        // add เข้า pending request ของเรา เพื่อรอให้อีกฝ่ายกดรับ
        const addToPendingResult = await User.findByIdAndUpdate(
            id,
            { '$push': { 'pendingFriendRequests': Types.ObjectId(friend) } }
        );

        // add เข้า friend requests ของเขา เพื่อเอาไปแสดง
        const addToRequestResult = await User.findByIdAndUpdate(
            friend,
            { '$push': { 'friendRequests': Types.ObjectId(id) } }
        );
        
        res.status(200).json({ isSuccess: true });
    } catch (error) {
        console.log(error);
    }
    
}

module.exports.acceptRequest = async (req, res) => {
    const { friend } = req.body;
    const id = getUserID(req.cookies.jwt);

    try {
        // เอา friend ออกจาก request ของเรา
        // add เข้า friends ของเรา
        const addToMyFriendsResult = await User.findByIdAndUpdate(
            id,
            { 
                '$pull': { 'friendRequests': Types.ObjectId(friend) },
                '$push': { 'friends': Types.ObjectId(friend) }
            }
        );

        // เอา friend ออกจาก pending request ของเขา
        // add เข้า friends ของเขา
        const addToTheirFriendsResult = await User.findByIdAndUpdate(
            friend,
            { 
                '$pull': { 'pendingFriendRequests': Types.ObjectId(id) },
                '$push': { 'friends': Types.ObjectId(id) } 
            }
        );
        
        res.status(200).json({ isSuccess: true });
    } catch (error) {
        console.log(error);
    }
    
}

module.exports.getFriends = async (req, res) => {
    const id = getUserID(req.cookies.jwt);
    
    try {
        const user = await User.findById(id);

        const friends = await User.find(
            { _id: { $in: user.friends }},
            { username: 1 },
        );

        res.status(200).json({ data: friends });
        
    } catch (error) {
        console.log(error);
    }
}

module.exports.getFriendRequests = async (req, res) => {
    const id = getUserID(req.cookies.jwt);
    
    try {
        const user = await User.findById(id);

        const friends = await User.find(
            { _id: { $in: user.friendRequests }},
            { username: 1 },
        );

        res.status(200).json({ data: friends });
        
    } catch (error) {
        console.log(error);
    }
}

module.exports.getSuggestionFriends = async (req, res) => {
    const id = getUserID(req.cookies.jwt);

    try {
        const user = await User.findById(id);

        const suggestionFriends = await User.find(
            {
                $and: [ 
                    { _id: { $ne : user._id} },
                    { _id: { $nin: user.friends } },
                    { _id: { $nin: user.friendRequests }},
                    { _id: { $nin: user.pendingFriendRequests }},
                ]
            },
            { username: 1 }
        );

        res.status(200).json({ data: suggestionFriends });

    } catch (error) {
        console.log(error);
    }
}