const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url =
  "mongodb+srv://dhinesh:admin123@cluster0.ipizq.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
let tasks = [];

app.get("/todolist", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    let data = await db.collection("tasks").find({}).toArray();

    //closing the connection
    await client.close();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.post("/create-task", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    let data = await db.collection("tasks").insertOne(req.body);

    //closing the connection
    await client.close();

    res.json({
      message: "Task created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.put("/update-task/:id", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    let data = await db
      .collection("tasks")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: req.body }
      );

    //closing the connection
    await client.close();

    res.json({
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.delete("/delete-task/:id", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    let data = await db
      .collection("tasks")
      .findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });

    //closing the connection
    await client.close();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.listen(PORT, function () {
  console.log(`App listening to the port ${PORT}`);
});
