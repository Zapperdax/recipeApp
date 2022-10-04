const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please Provide A Valid Email');
            }
        }
    },
    password: {
        type: String,
        minlength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({email});
    if(!admin){
        throw new Error('No Such Admin');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if(!isMatch){
        throw new Error('No Such Admin');
    }

    return admin;
}

adminSchema.methods.generateAuthToken = async function(){
    const admin = this;
    const token = jwt.sign({_id: admin._id.toString()}, 'thisiszapperdax');
    admin.tokens = admin.tokens.concat({token})
    await admin.save()
    return token;
}

adminSchema.pre('save', async function(next) {
    const admin = this;
    if(admin.isModified('password')){
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;