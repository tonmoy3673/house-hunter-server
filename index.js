const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


// Mongodb
const uri = process.env.HH_URI;

mongoose.connect(uri,);
const db = mongoose.connection;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

db.once('open', () => {
    console.log('Connected to MongoDB!');
});

// User Model
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please provide a Full Name!"],
    },
    imageUrl: {
        type: String,
        required: [true, "Please provide an imageUrl!"],
    },
    role: {
        type: String,
        required: [true, "Please provide a Role!"],
    },
    phoneNumber: {
        type: String,
        required: [true, "Please provide a Phone Number!"],
    },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
});


const User = mongoose.model('Users', UserSchema);


// register endpoint
app.post("/register", (req, res) => {
    console.log(req.body)
    // hash the password
    bcrypt
        .hash(req.body.password, 10)
        .then((hashedPassword) => {
            // create a new user instance and collect the data
            const user = new User({
                email: req.body.email,
                password: hashedPassword,
                fullName: req.body.fullName,
                role: req.body.role,
                phoneNumber: req.body.phoneNumber,
                imageUrl: req.body.imageUrl,
            });

            // save the new user
            user.save()
                // return success if the new user is added to the database successfully
                .then((result) => {
                    res.status(201).send({
                        message: "User Created Successfully",
                        result,
                    });
                })
                // catch error if the new user wasn't added successfully to the database
                .catch((error) => {
                    res.status(500).send({
                        message: "Error creating user",
                        error,
                    });
                });
        })
        // catch error if the password hash isn't successful
        .catch((e) => {
            res.status(500).send({
                message: "Password was not hashed successfully",
                e,
            });
        });
});

// Get Users endpoint
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.send({ message: 'Something went wrong' });
    }
})

// Get User endpoint
app.get('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'House not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Delete User endpoint
app.delete('/users-delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndDelete(id);
        res.status(201).send({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong!' });
    }
})



app.post("/login", (request, response) => {
    
    User.findOne({ email: request.body.email })
  
      
      .then((user) => {
        
        bcrypt
          .compare(request.body.password, user.password)
  
          
          .then((passwordCheck) => {
  
            
            if(!passwordCheck) {
              return response.status(400).send({
                message: "Passwords does not match",
                error,
              });
            }
  
            //   create JWT token
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              process.env.ACCESS_TOKEN,
              { expiresIn: "1d" }
            );
  
            //   return success response
            response.status(200).send({
              message: "Login Successful",
              email: user.email,
              token,
            });
          })
          // catch error if password does not match
          .catch((error) => {
            response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          });
      })
      // catch error if email does not exist
      .catch((e) => {
        response.status(404).send({
          message: "Email not found",
          e,
        });
      });
  });
  


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized access')
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;

        next()
    })

}


// free endpoint
app.get("/free-endpoint", (req, res) => {
    res.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", verifyJWT, (req, res) => {
    res.json({ message: "You are authorized to access me" });
});


const houseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    bathrooms: {
        type: Number,
        required: true,
    },
    roomSize: {
        type: Number,
        required: true,
    },
    picture: {
        type: String,
        required: true,
    },
    availabilityDate: {
        type: Date,
        required: true,
    },
    rentPerMonth: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    houseowner: {
        type: String,
        required: true,
    },
    ownremail: {
        type: String,
        required: true,
    },
});

const House = mongoose.model('House', houseSchema);


app.get('/houses', async (req, res) => {
    try {
        const allHouses = await House.find();
        res.send(allHouses);
    } catch (error) {
        res.send({ message: 'Something went wrong' });
    }
});

app.post('/houses', async (req, res) => {
    try {
        const house = new House(req.body);
        const allHouses = await House.find();
        const savedHouse = await house.save();
        res.status(201).send({ message: 'Successfully added', id: savedHouse._id, data: allHouses});
    } catch (error) {
        console.error('Error saving house:', error);
        res.status(500).send({ message: 'Something went wrong!' });
    }
});


app.get('/houses/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const house = await House.findById(id);
        if (!house) {
            return res.status(404).json({ error: 'House not found' });
        }
        res.json(house);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/houses/:id', async (req, res) => {
    const id = req.params.id;
    const houseData = req.body;
    try {
        const updatedHouse = await House.findByIdAndUpdate(id, houseData, { new: true });
        res.status(201).send({ message: 'Update successful', updatedHouse });
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong!' });
    }
});

app.delete('/houses/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await House.findByIdAndDelete(id);
        res.status(201).send({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong!' });
    }
});

app.get('/', (req, res) => {
    res.send({ message: 'Working' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
