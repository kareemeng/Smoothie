const User = require('../models/User');
const jwt = require('jsonwebtoken');
//handle Error
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };
    //incorrect email
    if (err.message === "incorrect email") {
        errors.email = "that email is not registered";
    }
    //incorrect password
    if (err.message === "incorrect password") {
        errors.password = "that password is incorrect";
    }

    //duplicate error code
    if (err.code === 11000) {
        errors['email'] = 'email already in use';
        return errors;
    }
    // validation errors
    if (err.message.includes('user validation failed')) {
        //we can use properties directly but we need to put them in  ({properties}).
        //or we can use error then error.properties  
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
};

const maxAge = 3 * 24 * 60 * 60; //3 days in seconds
const createToken = (id) => {
    //the second parameter is the secret that validate the jwt token.
    return jwt.sign({ id }, process.env.pepper, { expiresIn: maxAge });
};



module.exports.signup_get = (req, res, next) => {
    res.render('signup');
}
module.exports.login_get = (req, res, next) => {
    res.render('login');
}
module.exports.signup_post = async(req, res, next) => {
    const { email, password } = req.body
    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        // console.log(err);
        const errors = handleError(err);
        res.status(400).json({ errors })
    }
}
module.exports.login_post = async(req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors });
    }
}
module.exports.logout_get = (req, res, next) => {
    res.cookie("jwt", '', { maxAge: 1 });
    console.log("logout");
    res.redirect('/');
}