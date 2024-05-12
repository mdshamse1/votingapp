const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generateToken} = require('../jwt');
const user = require('../models/user');
const { message } = require('prompt');
const { json } = require('body-parser');



router.post('/signup',async(req,res)=>{
    try{
        const data = req.body //assuming request body contains the user data

    //create user document using mongoose model
    const newuser = new user(data);
    
    // save new user to the database
    const response = await newuser.save();
    console.log('data saved');
    const payload = {
        id: response.id,
    }
    console.log(JSON.stringify(payload))
    // token 
    const token = generateToken(payload);
    console.log('Token is: ',token);
    console.log("data saved");
    res.status(200).json({response:response,toke:token});//send back the response and a token
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})

//login route 
router.post("/login", async (req, res) => {
    try {
        const { adharcardNumber, password } = req.body;
        const foundUser = await user.findOne({ adharcardNumber }); // Use a different variable name

        if (!foundUser || !(await foundUser.comparePassword(String(password)))) {
            return res.status(401).json({ error: 'Invalid adharcardNumber or password' });
        }

        const token = generateToken({ id: foundUser.id, adharcardNumber });
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Profile route 
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const foundUser = await user.findById(userId); 
        res.status(200).json({ user: foundUser }); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// for update using id 
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const { id: userId } = req.user; // Extract id from req.user
        const { currentPassword, newPassword } = req.body; // Extract the new and current password from body

        // Find user by userId
        const foundUser = await user.findById(userId);

        // If password doesn't match, return error
        if (!(await foundUser.comparePassword(String(currentPassword)))) {
            return res.status(401).json({ error: 'Invalid adharcardNumber or password' });
        }
        // Update the user's password
        foundUser.password = newPassword;
        await foundUser.save();
        console.log("Password updated");
        return res.status(200).json({ message: 'Password Updated Successfully!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;