const express = require('express')
const app = express()
var cors = require('cors')
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 5000
var bodyParser = require('body-parser')
require('dotenv').config()

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser())

const verifyToken = (req, res, next) => {
    console.log("inside verify", req.cookies);
    const token = req?.cookies?.token
    if (!token) { return res.status(401).send({ message: 'unauthorized access' }) }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) { return res.status(401).send({ message: 'unauthorized access' }) }
        next();
    })

}



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j0geh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const userCollection = client.db("espressoDB").collection("User");
        const productsCollection = client.db("espressoDB").collection("Product");

        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' })

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, //false for developer mode and true for production 
            })
            res.send({ success: true })
        }
        )
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/loginuser/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            console.log(user);

            res.send(user);


        })

        app.get('/alluser', verifyToken, async (req, res) => {
            const user = await userCollection.find().toArray();

            res.send(user);
        })

        // make moderator api
        app.put('/user/make-moderator/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'moderator' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);


            res.send(result);

        })


        // add product api

        app.post('/addproduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        app.get('/allproduct', async (req, res) => {
            const prodcuts = await productsCollection.find().toArray();
            res.send(prodcuts);
        })



        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Espresso emporium')

})

app.listen(port, () => {
    console.log(`Espresso emporium app listening on port ${port}`)
    console.log(process.env.DB_USER);

})