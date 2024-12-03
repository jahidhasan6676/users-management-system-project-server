const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.wwm8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("Users_Management").collection("Users");

    app.get("/users", async (req, res) => {
      const {search} = req.query;
      console.log(search)

      let option = {};
      if(search){
        option = {name: { $regex: search, $options: "i" }}
      }
      // let option = {name:{$regex: search, $options: "i"}}

      const cursor = usersCollection.find(option);
      const result = await cursor.toArray();
      res.send(result);

    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.put("/users/:id", async(req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          name: user.name,
          email: user.email,
          gender: user.gender,
          status: user.status,
        }
      };
      const result = await usersCollection.updateOne(filter,updateUser,options);
      res.send(result);
    })

    // accept user
    app.put("/status/:id", async(req, res) => {
      const id = req.params.id;
      // const user = req.body;
      const filter = { _id: new ObjectId(id) };
      // const options = { upsert: true };
      const updateUser = {
        $set: {
          isCompleted: true,
        }
      };
      const result = await usersCollection.updateOne(filter,updateUser);
      res.send(result);
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("users management system server running");
});

app.listen(port, () => {
  console.log(`users server port is: ${port}`);
});
