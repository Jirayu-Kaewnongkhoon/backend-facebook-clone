const User = require('../models/user');
const jwt = require('jsonwebtoken');


const exp = 24 * 60 * 60; // sec.
const createToken = (id) => {
    return jwt.sign({ id }, 'my-secret', { expiresIn: exp });
}


module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: exp * 1000 });
        res.status(200).json({ user: user._id });

    } catch (error) {
        console.log(error);
    }
}

module.exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = new User({ email, password });
        const result = await user.save();
        const token = createToken(result._id);
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: exp * 1000 });
        res.status(200).json({ user: result._id });

    } catch (error) {
        console.log(error);
    }
}

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ isSuccess: true });
}