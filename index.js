const socket = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser')
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { requireAuth } = require('./middleware/authMiddleware');
const User = require('./models/user');

require('dotenv').config();

const app = express();

const DBURI = 'mongodb+srv://test:test1234@cluster0.cqano.mongodb.net/facebook-clone?retryWrites=true&w=majority';

let users = []

// connect database
mongoose.connect(DBURI)
    .then(() => {
        console.log('Connected to database');
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log('Server running on port 3000');
        });
        
        const io = socket(server);
        
        io.on('connection', (socket) => {

            const currentUser = {
                socketID: socket.id,
                userID: socket.handshake.query.userID
            }
            console.log('USER: ', currentUser);

            const userIndex = users.findIndex(user => user.userID === currentUser.userID);

            if (userIndex === -1) {
                users = [...users, currentUser]
            } else {
                users[userIndex] = currentUser
            }

            console.log(users);


            socket.on('join-room', async () => {
                
                // หา user ด้วย id ที่แนบมา
                const user = await User.findById(currentUser.userID);

                if (user) {

                    // join room ตัวเอง
                    socket.join(user._id.toString());

                    // join room เพื่อน
                    user.friends.forEach(friend => {
                        socket.join(friend.toString())
                    });

                    console.log('ROOMS: ', socket.rooms);

                }

            })
        

            socket.on('addFriend', async (friendID) => {
                const friend = users.find(user => user.userID === friendID)
                const user = await User.findById(currentUser.userID);
                
                // ถ้ามีใน list ก็จะส่ง data ไปแจ้ง
                // ถ้าไม่มีใน list (ไม่ได้ online) ก็จะไม่ต้องทำอะไร (จะทำงานส่วน db อย่างเดียว)
                if (friend) {
                    console.log(`${currentUser.userID} add ${friend.userID}`);
                    socket.to(friend.socketID).emit('addFriend', {
                        username: user.username,
                        _id: user._id
                    });
                }
            })


            socket.on('acceptRequest', async (friendID) => {
                const friend = users.find(user => user.userID === friendID);
                const user = await User.findById(currentUser.userID);

                // ถ้ามีใน list ก็จะส่ง data ไปแจ้ง
                // ถ้าไม่มีใน list (ไม่ได้ online) ก็จะไม่ต้องทำอะไร (จะทำงานส่วน db อย่างเดียว)
                if (friend) {
                    console.log(`${currentUser.userID} accept ${friend.userID}`);
                    socket.to(friend.socketID).emit('acceptRequest', {
                        username: user.username,
                        _id: user._id
                    })
                }
            })


            // ถ้า user ส่ง post มา
            // จะ emit post ไปให้ทุกคนที่เป็นเพื่อน
            socket.on('add-post', (post) => {
                const userID = post.user._id;

                // ส่ง post ไปให้ทุกคนที่ join ห้องเราอยู่
                socket.to(userID.toString()).emit('receive-post', post);
            })

        
            socket.on('logout', () => {
                console.log('LOGOUT');
                socket.disconnect();
            })
            

            socket.on('disconnect', () => {
                users = users.filter(user => user.userID !== currentUser.userID);
                console.log(users);
                console.log('USER DISCONNECTED');
            })
        })
    })
    .catch((err) => {
        console.log(err);
    });


// middleware
app.use(cors({
    origin: ['http://localhost:8080', 'https://facebook-clone-53701.firebaseapp.com'], 
    credentials: true 
}));
app.use(cookieParser());
// handle request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routes
app.use('/auth', authRoutes);
app.use('/post', requireAuth, postRoutes);
app.use('/user', requireAuth, userRoutes);