const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtAuthMiddleware = (req, res, next) => {
    //extract the jwt token from the request header
    const token = req.headers.authorization.split(' ')[1]; 
    if(!token) return res.status(401).json({error:'Unauthorized'});

    try{
        //verify jwt token
       const decoded = jwt.verify(token,process.env.JWT_SECRET);

       //Attach user information to the request object
       req.user = decoded
       next();

    }catch(err){
        console.log(err);
        res.status(401).json({error:"Invalid token"});
    }
}

// function to generate token 

const generateToken = (userData)=>{
    // generate a new jwt token using user data 
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:3000});
}

module.exports = {jwtAuthMiddleware,generateToken};