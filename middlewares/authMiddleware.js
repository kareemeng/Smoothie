const { redirect } = require('express/lib/response');
const jws = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    //check if token is existing & valid.
    if (!token) {
        res.redirect("/login");
    } else {
        jws.verify(token, process.env.pepper, (err, decodedToken) => {
            if (err) {
                console.log(err);
                res.redirect("/login");
            } else {
                //console.log(decodedToken);
                next();
            }
        });
    }
};
//check the authorized user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    //check if token is existing & valid. 
    if (!token) {
        res.locals.currentUser = null;
        next();
    } else {
        jws.verify(token, process.env.pepper, async(err, decodedToken) => {
            if (err) {
                console.log(err);
                res.locals.currentUser = null;
                next();
            } else {
                //console.log(decodedToken);
                const currentUser = await User.findById(decodedToken.id);
                res.locals.currentUser = currentUser;
                next();
            }
        });
    }
};
module.exports = { requireAuth, checkUser };