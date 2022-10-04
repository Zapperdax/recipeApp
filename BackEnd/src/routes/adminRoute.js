const express = require('express');
const router = new express.Router();
const Admin = require('../models/adminModel');
const auth = require('../middleware/auth');
const OTP = require('../models/otpModal');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/sendOTP');


router.get('/admin/me', auth, async (req, res)=> {
    res.send(req.admin);
})
router.post('/adminDetails', async (req, res)=> {
    try{
        const admin = new Admin(req.body);
        await admin.save();
        const token = await admin.generateAuthToken();
        res.status(201).send({admin, token});
    } catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/admin/login', async (req, res)=> {
    try{
        const admin = await Admin.findByCredentials(req.body.email, req.body.password);
        const token = await admin.generateAuthToken();
        res.send({admin, token});
    } catch(err){
        res.status(400).send(err.message);
    }
});

router.post('/admin/logout', auth, async(req, res)=> {
    try{
        req.admin.tokens = req.admin.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.admin.save();
        res.send();
    } catch(err){
        res.status(500).send();
    }
});

router.post('/admin/logoutAll', auth, async (req, res)=> {
    try{
        req.admin.tokens = [];
        await req.admin.save();
        res.send();
    } catch(err){
        res.status(500).send();
    }
});

router.patch('/admin/me', auth, async (req, res)=> {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'password'];
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidUpdate) {
        return res.status(400).send({"ERROR": "Invalid Updates Found"});
    }

    try{
        updates.forEach((update)=> req.admin[update] = req.body[update]);
        await req.admin.save();
        res.send(req.admin);
    } catch(err){
        res.status(400).send(err);
    }
});

router.post('/resetPassword', async (req, res)=> {
    try{
        const email = req.body.email;
        const otp = await generateOTP();
        await sendOTP(otp, email);
        OTP.findOneAndUpdate({email: email}, {otp: otp}, {upsert: true}, (err, result)=> {
            if(err){
                return res.status(500).send(err);
            }
            console.log(result);
            res.json({
                message: 'OTP Saved',
                result: result
            })
        })
        
    } catch(err){
        res.status(500).send(err.message);
    }
});

module.exports = router;