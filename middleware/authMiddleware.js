const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {

        jwt.verify(token, 'my-secret', (err, decodeToken) => {

            if (err) {
                
                res.status(401).json({ error: 'Unauthorized: You don\'t have perrmission.' });

            } else {
                
                next();

            }

        });

    } else {

        res.status(401).json({ error: 'Unauthorized: You don\'t have perrmission.' });

    }
}

module.exports = { requireAuth }