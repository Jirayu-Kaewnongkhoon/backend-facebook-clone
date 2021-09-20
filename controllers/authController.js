const User = require('../models/user');
const jwt = require('jsonwebtoken');


const exp = 24 * 60 * 60; // sec.
const createToken = (id) => {
    return jwt.sign({ id }, 'my-secret', { expiresIn: exp });
}

const handleErrors = (error) => {
    let errors = { username: '', email: '', password: '' };

    if (error.code === 11000) {
        errors.email = 'email is already registerd';
        return errors;
    }

    if (error.message.includes('incorrect email')) {
        errors.email = 'email is incorrect';
    }

    if (error.message.includes('incorrect password')) {
        errors.password = 'password is incorrect';
    }

    if (error.message.includes('User validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}


module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: exp * 1000 });
        res.status(200).json({ user: user._id });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password });
        const result = await user.save();
        const token = createToken(result._id);
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: exp * 1000 });
        res.status(200).json({ user: result._id });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ isSuccess: true });
}