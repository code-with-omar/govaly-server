const express = require("express");
const app = express();
const cors = require("cors");

const { ObjectId } = require("mongodb");

require("dotenv").config();
//port
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yziu76d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("multiVanderDB").collection("users");
    const productsCollection = client
      .db("multiVanderDB")
      .collection("products");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/products", async (req, res) => {
      try {
        const newProducts = req.body; // Array of products

        for (const product of newProducts) {
          await productsCollection.deleteMany({ name: product.name });
        }

        const result = await productsCollection.insertMany(newProducts);
        res.send(result);
      } catch (error) {
        console.error("Error inserting products:", error);
        res.status(500).send("Failed to insert products.");
      }
    });

    app.get("/products", async (req, res) => {
      const products = productsCollection.find();
      const result = await products.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello I am from server");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
