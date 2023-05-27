const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b1uj4ox.mongodb.net/?retryWrites=true&w=majority`;
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
        await client.connect();

        const toysCollection = client.db('toyLand').collection('allToys');

        // app.get('/allToys', async (req, res) => {

        //     const data = req.query;
        //     const category = req.query.category;
        //     const search = req.query.search;

        //     let query = {};
        //     if (category) {
        //         query = {sub_category: category}
        //     }
        //     if(search){
        //         query= {name: {regex:search, options: "i"}}
        //     }



        //     const result = await toysCollection
        //         .find(query)
        //         .toArray();
        //     res.send(result);
        // })

        app.get("/allToy", async (req, res) => {
            const result = await toysCollection.estimatedDocumentCount();
            res.send({ result });
        });

        app.get("/allToys", async (req, res) => {
            const data = req.query;

            const category = req.query.category;
            const search = req.query.search;

            let query = {};

            if (category) {
                query = { sub_category: category };
            }

            if (search) {
                search = { name: { $regex: search, $options: 'i' } }
            }

            const page = parseInt(data.page) || 0;
            const limit = parseInt(data.limit) || 20;
            const skip = page * limit;

            const result = await toysCollection
                .find(query)
                .skip(skip)
                .limit(limit)
                .toArray();
            res.send(result);
        });

        app.get('/toy/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await toysCollection.findOne(query);
            res.send(result)
        } )


        app.post('/allToys', async (req, res) => {
            const addToy = req.body;
            const result = await toysCollection.insertOne(addToy);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('toyland is running')
})


app.listen(port, () => {
    console.log(`ToyLand server is running on port ${port}`)
})