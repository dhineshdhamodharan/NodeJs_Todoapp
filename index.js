const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const bcryptjs = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv");
dotenv.config();
//console.log(process.env);
//const url =
//  "mongodb+srv://dhinesh:admin123@cluster0.ipizq.mongodb.net/?retryWrites=true&w=majority";
const url = process.env.DB;
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "*",
  })
);

function authenticate(req, res, next) {
  try {
    console.log(req.headers.authorization);
    //check if token is present
    //if present -> check it is valid
    if (req.headers.authorization) {
      jwt.verify(
        req.headers.authorization,
        "EgK(/8}TC8veVBK?",
        function (error, decoded) {
          if (error) {
            res.status(500).json({
              message: "Unauthorzed",
            });
          } else {
            console.log(decoded);
            req.userid = decoded.id;
            next();
          }
        }
      );
    } else {
      res.status(401).json({
        message: "No token present",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

app.use(express.json());

app.post("/register", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");
    //Hash the password
    let salt = bcryptjs.genSaltSync(10);
    let hash = bcryptjs.hashSync(req.body.password, salt);
    req.body.password = hash;

    //select the collection and perform action
    delete req.body.confrimpassword;
    let data = await db.collection("users").insertOne(req.body);

    //closing the connection
    await client.close();

    res.json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      id: data._id,
    });
  }
});

app.post("/login", async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //find the user with email

    let user = await db
      .collection("users")
      .findOne({ username: req.body.username });
    if (user) {
      // hash the incoming password
      // compare password with users password
      let matchPassword = bcryptjs.compareSync(
        req.body.password,
        user.password
      );
      if (matchPassword) {
        //generate JWT token
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECERT);
        console.log(token);
        res.json({
          message: true,
          token,
        });
      } else {
        res.status(404).json({
          message: "Username/Password incorrect",
        });
      }
      //if both are correct then allow
    } else {
      res.status(404).json({
        message: "Username/Password incorrect",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/todolist", [authenticate], async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    let data = await db
      .collection("tasks")
      .find({ userid: req.userid })
      .toArray();

    //closing the connection
    await client.close();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

app.post("/create-task", [authenticate], async function (req, res) {
  try {
    //connect the DB
    let client = await mongoClient.connect(url);

    //select DB
    let db = client.db("todo-app");

    //select the collection and perform action
    req.body.userid = req.userid;
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

app.put("/update-task/:id", [authenticate], async function (req, res) {
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

app.delete("/delete-task/:id", [authenticate], async function (req, res) {
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

app.get("/dashboard", [authenticate], async function (req, res) {
  res.json({
    message: "Protected data",
  });
});

app.listen(PORT, function () {
  console.log(`App listening to the port ${PORT}`);
});
