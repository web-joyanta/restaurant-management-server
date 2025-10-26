require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.z1ypfcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const database = client.db("restaurantDB");
        const foodsCollection = database.collection("foods");
        const purchasesCollection = database.collection("purchases");

        // get all foods data from bd
        app.get('/foods', async (req, res) => {
            const cursor = foodsCollection.find();
            const foods = await cursor.toArray();
            res.send(foods);
        })

        // get a single food data by id form bd
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const food = await foodsCollection.findOne(query);
            res.send(food);
        });

        // post food data to bd
        app.post('/foods', async (req, res) => {
            const newFood = req.body;
            const result = await foodsCollection.insertOne(newFood);
            res.send(result);
        });

        // post food purchases
        app.post('/purchases', async (req, res) => {
            const purchaseFood = req.body;
            const result = await purchasesCollection.insertOne(purchaseFood);
            res.send(result);
        })

        // patch food quantity or purchase
        app.patch('/food/:id', async (req, res) => {
            const id = req.params.id;
            const { quantity, purchase } = req.body;
            const query = { _id: new ObjectId(id) };
            const update = { $set: { quantity, purchase } }
            const result = await foodsCollection.updateOne(query, update);
            res.send(result);
        })

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});
