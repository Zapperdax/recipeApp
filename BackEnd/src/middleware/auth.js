const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const auth = async (req, res, next)=> {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisiszapperdax');
        const admin = await Admin.findOne({_id: decoded._id, 'tokens.token': token});
        if(!admin){
            throw new Error();
        }
        req.token = token;
        req.admin = admin;
        next();
    } catch(err){
        res.status(401).send({"ERROR": "Please Authenticate"});
    }
}

module.exports = auth;