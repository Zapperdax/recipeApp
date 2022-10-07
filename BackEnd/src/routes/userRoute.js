const express = require('express');
const router = new express.Router();
const User = require('../models/userModel');
const Favorite = require('../models/favoriteModel');
const Recipe = require('../models/recipeModel');
const userAuth = require('../middleware/userAuth');

router.post('/user', async (req, res)=> {
    try{
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch(err){
        res.status(500).send(err.message);
    }
})

router.get('/users', async(req, res)=> {
    try{
        const users = await User.find({});
        if(!users){
            return res.status(400).send();
        }
        res.send(users);
    } catch(err){
        res.status(400).send();
    }
});

router.get('/user/me', userAuth, async(req, res)=> {
    res.send(req.user);
})

router.post('/user/login', async (req, res)=> {
    try{
        const user = await User.findByCredentials(req.body.userName, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch(err){
        res.status(400).send()
    }
});

router.post('/user/logoutAll', userAuth, async (req, res)=> {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send(req.user);
    } catch(err){
        res.status(400).send();
    }
});

router.post('/favorite/:id', userAuth, async(req, res)=> {
    try{
        const user = req.user;
        const recipe = await Recipe.findOne({_id: req.params.id});
        const recipeId = recipe._id;
        const alreadyPresent = await Favorite.findOne({userId: user._id, recipeId: recipeId});
        if(alreadyPresent){
            throw new Error('Recipe Already Favorite');
        }
        const favorite = new Favorite({userId: user._id, recipeId: recipeId});
        await favorite.save();
        res.send(favorite);
    } catch(err){
        res.status(400).send(err.message);
    }
})


module.exports = router;