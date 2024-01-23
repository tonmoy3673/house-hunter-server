const express=require('express');
const app=express()
const cors=require('cors');
const bcrypt=require('bcrypt');
const bodyParser=require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port=process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())
app.get('/',(req,res)=>{
    res.send('House Hunter Service is Running')
})

app.listen(port,()=>{
    console.log(`House Hunter is running on ${port}`)
})