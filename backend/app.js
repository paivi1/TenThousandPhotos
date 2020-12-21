const path = require('path') // Allows us to construct safe & correct paths accessable through API calls
const express = require('express');  // Out server-side routing middleware
const bodyParser = require('body-parser'); // Allows us to easily parse http/https request bodies
const mongoose = require('mongoose'); // Our beloved mongoose, allowing us to easily work with the MongoDB Atlas API for all out storage needs

const postsRoutes = require("./routes/posts"); // The routes we are using to handle requests based off of the URL

const cluster_user = "rk_admin";
const cluster_pwd = "gyUIrpf6h8OSrYoq";
const db_name = "TenThousandPhotos";

const connectionString = "mongodb+srv://" + cluster_user + ":" + cluster_pwd + "@cluster0.wic47.mongodb.net/" + db_name + "?retryWrites=true&w=majority"

// Use mongoose to connect to the Mongo database using the provided connection string.
mongoose.connect(connectionString)
.then(() => {
  console.log('Connected to Database');
})
.catch(() => {
  console.log('Connection Failed');
})

const app = express(); // Instantiate Express router


app.use(bodyParser.json()); // Process using json parser before moving forward
app.use(bodyParser.urlencoded({ extended: false })); // parse urlencoded data
app.use("/images", express.static(path.join("backend/images"))); // requests targetting '/images' will be routed to 'backend/images'. Path is relative to 'server.js'


// Set our headers for Access Control. This is mostly to avoid CORS errors when running locally, but is also best-practice regardless.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS") // The methods required by our application. OPTIONS is called in the background of most requests
  next();
})

app.use("/api/posts", postsRoutes); // Pass control forward to our post routes


module.exports = app;
