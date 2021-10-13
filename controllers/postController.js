const { Types } = require('mongoose');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const getUserID = (token) => {
    // decode jwt ที่แนบมากับ cookie เพื่อดึงเอา userID
    const decoded = jwt.decode(token, { complete: true });
    return Types.ObjectId(decoded.payload.id)
}


module.exports.getPosts = async (req, res) => {

    const id = getUserID(req.cookies.jwt);
    const user = await User.findById(id);

    // aggregate => ใช้ query data แบบ advance
    // lookup => join collection ด้วย field
    // unwind => จะทำให้ user ที่ได้มา กลายเป็น obj (ถ้าไม่ใส่จะได้ user: [{}])
    // project => ใช้จัดการเลือก field มาแสดง output
    Post.aggregate([
        {
            $match: { 
                $or: [ 
                    { user: id },
                    { user: { $in: user.friends } }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            }
        },
        { 
            $unwind: '$user' 
        },
        { 
            $project: { 
                user: { 
                    email: 0,
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                } 
            }
        }
    ]).sort({ createdAt: -1 })
        .then(result => res.json({ data: result }))
        .catch(err => console.log(err))
}

module.exports.addPost = (req, res) => {

    const user = getUserID(req.cookies.jwt);
    const { text } = req.body;

    const post = new Post({ text, user });
    
    post.save()
        .then(result => res.json({ data: post }))
        .catch(err => console.log(err))
}