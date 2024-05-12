const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
const PORT  = process.env.PORT || 3000;


// jwt token 


//get person routes here 
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
app.use('/candidate',candidateRoutes);
app.use('/users',userRoutes);


app.listen(PORT,()=>{
    console.log("server is runing on port 3000 ")
})