const express = require('express');
const router = new express.Router();
const Admin = require('../models/adminModel');
const auth = require('../middleware/auth');
const OTP = require('../models/otpModal');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/sendOTP');
const bcrypt = require('bcrypt');
const { Router } = require('express');
const jwt = require('jsonwebtoken');

router.get('/admin/me', auth, async (req, res)=> {
    const admin = req.admin;
    const token = req.token;
    res.send({admin, token});
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
        res.send(req.admin);
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

router.post('/sendOTP', async (req, res)=> {
    try{
        const email = req.body.email;
        const admin = await Admin.findOne({email: email});
        if(!admin){
            return res.status(400).send({"ERROR:": "No Such Admin"});
        }
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

router.post('/getOTP', async (req, res) => {
    try{
        const otp = await OTP.findOne({email: req.body.email});
        if(!otp){
            return res.status(400).send();
        }
        res.send(otp);
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.post('/changePassword', auth, async (req, res)=> {
    try{
        req.admin.password = req.body.password;
        await req.admin.save();
        res.send(req.admin);
    } catch(err){
        res.status(500).send(err.message);
    }
});

router.post('/matchPassword', auth, async (req, res)=> {
    try{
        const match = await bcrypt.compare(req.body.password, req.admin.password);
        if(!match){
            return res.status(400).send({"ERROR": "Current Password Is Incorrect"});
        }
        res.status(200).send();
    } catch(err){
        res.status(500).send(err.message)
    }
})

router.get('/getToken', auth, async (req, res)=> {
    try{
        const token = req.admin.token;
        if(!token){
            return res.status(400).send();
        }
        res.send(token);
    } catch(err){
        console.log(err);
    }
})

router.post('/verifyToken', async (req, res)=> {
    try{
        const verified = jwt.verify(req.body.token, 'thisiszapperdax');
        if(!verified){
            return res.send({"ERROR": "ERROR"})
        }
        res.json({"Status": "Matched"}).send();
    } catch(err){
        res.status(500).send();
    }
})

module.exports = router;