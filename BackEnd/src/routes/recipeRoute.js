const express = require('express');
const router = new express.Router();
const Recipe = require('../models/recipeModel');
const multer = require('multer');
const { request } = require('express');

var storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "../FrontEnd/my-app/public/images/");
    },
    filename: (req,file,cb) => {
        cb(null ,Date.now() + "--" + file.originalname)
    }
})
var upload = multer({storage:storage})

router.post('/recipe', upload.single('image'), async (req, res)=> {
    try{
        console.log(req.file);

        if(req.file){
            const recipe = new Recipe({
                ...req.body,
                image: req.file.path
            });
            await recipe.save();
            res.send(recipe);

        } else {
            const recipe = new Recipe({
                ...req.body,
            });
            await recipe.save();
            res.send(recipe);

        }
    } catch(err){
        res.status(400).send(err.message);
    }
});

router.get('/recipes', async (req, res)=> {
    try{
        const recipes = await Recipe.find({}).sort({_id:-1});
        if(!recipes){
            return res.status(400).send()
        }
        res.send(recipes)
    } catch(err){
        res.status(400).send();
    }
});

router.get('/recipe/:id', async(req, res)=> {
    try{
        const recipe = await Recipe.findOne({_id: req.params.id});
        if(!recipe){
            return res.status(400).send()
        }
        res.send(recipe);
    }catch(err){
        res.status(400).send()
    }
})

router.patch('/recipe/:id', upload.single('image'), async (req, res)=> {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['recipeName', 'recipeTime', 'recipeServing', 'recipeIngredients', 'recipeQuantity', 'recipeProcess', 'recipeDescription', 'recipePrice', 'image'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidUpdate) {
        return res.status(400).send({"ERROR": "Invalid Updates Found"});
    }

    try{
        const recipe = await Recipe.findByIdAndUpdate(req.params.id);
        if(!recipe){
            return res.status(400).send();
        }
        updates.forEach((update)=> recipe[update] = req.body[update]);
        if(req.file){
            recipe.image= req.file.path;
        }
        await recipe.save();
        res.send(recipe);
    } catch(err){
        res.status(400).send(err);
    }
});

router.delete('/recipe/:id', async (req, res)=> {
    try{
        const recipe = await Recipe.findOneAndDelete({_id: req.params.id});
        if(!recipe){
            return res.status(400).send();
        }
        res.send(recipe);
    } catch(err){
        res.status(400).send(err);
    }
})

module.exports = router;