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
        const userCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        app.post('/products', async(req, res) =>{
            const product = req.body;
            console.log(product)
            const result = await productCollection.insertOne(product);
            res.json(result);
        })

        app.post('/orders', async(req, res) =>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        app.post('/reviews', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })

        app.get('/orders', async(req, res) =>{
            const query = req.query.email;
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            
            if(query){
                const searchResult = orders.filter(order=>order.email===query);
                res.json(searchResult);
            }
            else{
                res.json(orders)
            }
        })

        app.get('/reviews', async(req, res) =>{
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews)
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
        });

        app.get('/users', async(req, res) =>{
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        })
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;                   
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        app.put('/orders/status', async (req, res) =>{
            const order = req.body;
            const filter = {status: order.status}
            const updateDoc = {$set: {status:'Shipped'}}
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
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