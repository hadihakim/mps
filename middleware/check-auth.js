const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const loginController = require('../controllers/loginController');
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if(!token) {
            throw new Error('Authentication failed!');
        }
        const decodedToken = jwt.verify(token, 'hadimps_itis_secret_key');
        req.userData = {UserId: decodedToken.UserId, Email: decodedToken.Email, Role: decodedToken.Role}
        next();
    } catch(err) {
        return res.status(401).render('login', { login: 'It is login page.', fail: 'Authorization failed. Login to continue.' });
        /*const error = new HttpError('Authentication failed', 401);
        return next(error);*/
    }
    
    
}