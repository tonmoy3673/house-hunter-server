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

const uri = process.env.URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {

        const houseCollection = client.db('HouseHunter').collection('houses');
    

        app.get('/houses', async (req, res) => {
            const query = {};
            try {
                const allHouses = await houseCollection.find(query).toArray();
                res.send(allHouses);
            } catch (error) {
                res.send({ massage: 'Something went wrong' })
            }
        })


        app.post('/houses', async (req, res) => {
            const house = req.body;
            try {
                await houseCollection.insertOne(house);
                res.status(201).send({ massage: 'successfully added' })
            } catch (error) {
                res.status(500).send({ massage: 'Something went wrong!' })
            }

        })


        app.get('/houses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const house = await houseCollection.findOne(query);
            res.send(house)
        })

        app.get('/house/:id',async(req,res)=>{
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
            
                const house = await houseCollection.findOne(query);
            
                if (!house) {
                  return res.status(404).json({ error: 'House not found' });
                }
                res.json(house);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })

        app.put('/houses/:id', async (req, res) => {
            const house = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            
            const updateDoc = {
                $set: house
            }
            await houseCollection.updateOne(filter, updateDoc)
            res.status(201).send({ massage: 'Update successfully' });
        })

        console.log('Connected to MongoDB!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    } finally {
        
    }
}
run().catch(console.error);


app.get('/',(req,res)=>{
    res.send('House Hunter Service is Running')
})

app.listen(port,()=>{
    console.log(`House Hunter is running on ${port}`)
})