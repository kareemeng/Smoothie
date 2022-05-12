const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: 'string',
        required: [true, 'please enter a email address'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'please enter a valid email address ']
    },
    password: {
        type: 'string',
        required: [true, 'please enter a password'],
        minlength: [4, 'Minimum Password Length is 4 Characters'],
    },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.statics.login = async function(email, password) {
    //this is refear to the user instance that calls the function.
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};


const User = mongoose.model('user', userSchema);
module.exports = User;