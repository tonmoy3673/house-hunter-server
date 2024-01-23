const express=require('express');
const app=express()
const cors=require('cors');
const port=5000;
app.use(cors());
app.get('/',(req,res)=>{
    res.send('House Hunter Service is Running')
})

app.listen(port,()=>{
    console.log(`House Hunter is running on ${port}`)
})