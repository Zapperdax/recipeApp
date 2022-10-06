const express = require('express');
const router = new express.Router();
const User = require('../models/userModel');

router.post('/user', async (req, res)=> {
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch(err){
        res.status(500).send(err.message);
    }
})

router.get('/users', async( req, res)=> {
    try{
        const users = await User.find({});
        if(!users){
            return res.status(400).send();
        }
        res.send(users);
    } catch(err){
        res.status(400).send();
    }
})

module.exports = router;