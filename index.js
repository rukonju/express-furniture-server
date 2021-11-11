const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4wgp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        await client.connect();
        const database = client.db('furnitures');
        const productCollection = database.collection('products');

        app.post('/products', async(req, res) =>{
            const product = req.body;
            console.log(product)
            const result = await productCollection.insertOne(product);
            res.json(result);
        })

        app.get('/products', async(req, res) =>{
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.json(products)
        })

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            
            res.send(product)
        })

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)



app.get('/', (req,res) =>{
    res.send('server is ruuning');
})

app.listen(port, () =>{
    console.log(`port number: ${port}`)
});