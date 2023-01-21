const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n3a0m.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xfbrdjn.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const addTaskCollections = client.db('taskManager').collection('taskCollection');
        const usersCollection = client.db('taskManager').collection('users');


        //verifyAdmin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };

            const user = await usersCollection.findOne(query);
            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'forbidden Access' });
            }
            next();
        }



        app.get('/taskManagement', async (req, res) => {
            const query = {};
            const cursor = await addTaskCollections.find(query).toArray();
            res.send(cursor)
        });

        app.get('/taskManagement/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const users = await addTaskCollections.findOne(query);
            res.send(users)
        })

        app.get('/taskManagementComplated', async (req, res) => {
            const query = { taskCondision: 'complated' };
            const result = await addTaskCollections.find(query).toArray();
            res.send(result);
        })

        app.post('/taskManagement', async (req, res) => {
            const addTask = req.body;
            const result = await addTaskCollections.insertOne(addTask);
            res.send(result)
        });

        app.put('/taskManagement/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedTask = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    taskTitle: updatedTask.taskTitle,
                    taskWork: updatedTask.taskWork,
                    startDate: updatedTask.startDate,
                    endDate: updatedTask.endDate,
                    email: updatedTask.email,
                    taskDescription: updatedTask.taskDescription
                }
            }
            const result = await addTaskCollections.updateOne(filter, updatedUser, option);
            res.send(result)
        })


        app.delete('/taskManagement/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await addTaskCollections.deleteOne(filter);
            res.send(result)
        })


        // check admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === "Admin" });
        })

        //add users to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const email = user.email;
            const query = {
                email: email
            }
            const savedUser = await usersCollection.findOne(query);
            if (!savedUser) {
                const result = await usersCollection.insertOne(user);
                return res.send(result);
            }
            res.send({ message: 'saved user' })
        })

















    }
    finally {

    }
}
run().catch(error => console.log(error))

app.get('/', (req, res) => {
    res.send('Task Management App Server is Running');
})

app.listen(port, () => {
    console.log(`Task Managment on Port ${port}`);
})