const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
}, { timestamps: true });


// pre => จะทำงานก่อน event 'save'
// ก่อน save data ลง db จะทำการ hash password ก่อน
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// statics => ใช้สร้าง function ที่สามารถเรียกใช้ผ่าน model ได้ (เหมือนการเขียน obj ทั่วไป)
// ต้องเป็น function เพื่อสามารถเรียกใช้ this (instance) จากตัวมันเองได้
// จะรับ email, password มา จากนั้นหาใน db ว่ามี user ไหม
// ถ้ามี ก็เอา password มาเทียบ
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });

    if (user) {
        
        const isAuth = await bcrypt.compare(password, user.password);
        
        if (isAuth) return user;

        throw Error('incorrect password');
    }

    throw Error('incorrect email');
}


const User = mongoose.model('User', userSchema);

module.exports = User;