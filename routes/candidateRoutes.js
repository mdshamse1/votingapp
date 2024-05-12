const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generateToken} = require('../jwt');
const candidate = require('../models/candidate');
const { message } = require('prompt');
const { json } = require('body-parser');
const user = require('../models/user');



// check admin 
const checkAdminRole = async (userId) => {
    try {
        const currentUser = await user.findById(userId); // Changed from 'user' to 'user.findById'
        if (currentUser.role === 'admin') {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

// post route to add a candidate 
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{

        if(!await checkAdminRole(req.user.id))
        return res.status(403).json({message:'You are not authorized'});

        const data = req.body //assuming request body contains candidate data

    //create candidate document using mongoose model
    const newcandidate = new candidate(data);
    
    // save new candidate to the database
    const response = await newcandidate.save();
    console.log('data saved');
    res.status(200).json({response:response});
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})


// for update using id 
router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id))
        return res.status(403).json({message:'You are not authorized'});

        const candidateID = req.params.candidateID; //extract id from url params
        const candidateUpdate = req.body; //update data for the candidate

        const response = await candidate.findByIdAndUpdate(candidateID,candidateUpdate,{
            new:true, //return updated document
            runValidators:true //run mongoose validation
        })
        if(!response){
            return res.status(403).json({error:"candidate not found"})
        }
        console.log("candidate data updated")
        return res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})


// for delete using id 
router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id))
        return res.status(403).json({message:'You are not authorized'});

        const candidateID = req.params.candidateID; //extract id from url params

        const response = await candidate.findByIdAndDelete(candidateID);
        if(!response){
            return res.status(403).json({error:"candidate not found"})
        }
        console.log("candidate data deleted")
        return res.status(200).json({message:"Data deleted successfully!"});
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})

// for voting 

router.post('/vote/candidateID',jwtAuthMiddleware,async(req,res)=>{
    candidateID = req.params.candidateID;
    userId = req.user.id;
    try{
        // find the candidate document with the specified id 
        const votecandidate = await candidate.findById(candidateID);
        if(!votecandidate){
            return res.status(404).json('Candidate not Found');
        }

        // add the user who is trying to vote
        const user = await user.findById(userId);
        if(!user){
            return res.status(404).json('user not Found');
        }
        // Checking whether the user has already voted or not 
        if(user.isVoted){
            return res.status(403).json('Already voted');
        }
        //admin not allowed to vote 
        if(user.userRole=='admin'){
            return res.status(403).json('You are not allowed to vote');
        }

        // update candidate doucment to record the vote 
        votecandidate.votes.push({user:userId})
        votecandidate.voteCount++;
        await  votecandidate.save();

        //update the user document to mark that he has cast his vote 
        user.isVoted=true;
        await user.save();
        res.status(200).json({message:"User Voted Successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})

// vote count 
router.get('vote/votecount',async(req,res)=>{
    try{
        // find all candidate and sort them by vote count in desc order 
        const votecandidate = await candidate.find().sort({voteCount:'desc'});

        // map the candidate to return only their name and vote count 
        const record = votecandidate.map((data)=>{
            return{
                party: data.party,
                voteCount: data.voteCount
            }
        });
        res.status(200).json(record);
    }catch(err){
        console.log(err);
        res.status(500).json(err,"Internal server error");
    }
})
module.exports = router;