const express = require('express');
const Post = require('../models/post');
const multer = require("multer"); // Multer is a middleware we use to easily handle multipart/form-data when users upload files
const util = require('util'); // Debugging request string problems
const router = express.Router();


const MIME_TYPE_MAP = { // Since we filter on the frontend form, we should only receive these three MIME types
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

// Note for multer 'cb' callback: 'cb' is provided by multer. It is a so called error-first function that allows you to pass an error as the first argument
// in the functino to be returned in the response. Can be somewhat understood as
// For destination: 'cb(error, '/if-no-error-upload-file-to-this-directory');'
// For filename: cb(error, '/if-no-error-upload-file-with-this-filename');


// Where to store things and how to store them
const storage = multer.diskStorage({ // Configure storage options to be passed to our multer middleware
  destination: (req, file, cb) => { // Function fires whenever multer tries to save a file
    const isValid = MIME_TYPE_MAP[file.mimetype]; // Retrieve the corresponding value from our mimetype map (if it is not there, 'null' is returned)
    let error = new Error("Invalid MIME type"); // A default return error is set
    if(isValid) { // If a valid MIME type (not 'null', as mentioned above) then set the error to 'null'
      error = null;
    }
    // Either return an error or save the file to this folder
    cb(error, "backend/images") // Seen relative to the SERVER file (server.js)
  },
  filename: (req, file, cb) => { // Here we save the file, named as shown below (lowercase, whitespace replaced with dashes)
    console.log(util.inspect("Name: " + file.originalname)); // Try and find out why 'legitposttitle/na' is giving us the wrong filename output
    const name = file.originalname.toLowerCase().split(' ').join('-'); // Normalize name (Using the posted titlename)
    const ext = MIME_TYPE_MAP[file.mimetype]; // Add the correct extension
    savedAs = name.replace(/[^a-zA-Z ]/g, "") + '-' + Date.now() + '.' + ext; // We need to make sure we don't have any special characters in name when saving (kind of a lazy solution)
    console.log("saved name: " + savedAs);
    cb(null, savedAs); // Ex 'myImage-164012463433.jpg'
  }
});

// POST new post route. Here we first save the uploaded image to our server, and then add the post to our database using a URL path in place of the
// original image file.
router.post("", multer({storage: storage}).single("image"), (req, res, next) => { // multer will try and find a single file from the request, looking for the 'image' property
  const url = req.protocol + '://' + req.get("host"); // Get the server address to construct our image path

  const post = new Post({ // Create a new Post object from the request body properties, but only save a filepath for the image
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename, // Image path to store in db
    filters: req.body.filters
  });

  post.save() // Save the new post to our database
  .then(createdPost =>{
    res.status(201).json({
      message:"Post added successfully",
      post: {
        ...createdPost, // Can more densely code below using the spread operator to copy all propoerties, and then we override the '_id' property to set it as 'id'
        id: createdPost._id
      }
    });
  })
});

// PUT request route for updating an existing post.
router.put("/:id", multer({storage: storage}).single("image"), (req,res,next) => {
  let imagePath = req.body.imagePath; // Default is the existing image path. If the update did not include a file this value will remain

  if(req.file) { // If there was a file sent in the request, then we need to modify the file representing the post's image. Thus, we set it to it's new path
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({ // Construct a new Post object with data recieved from request
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    filters: req.body.filters
  });
  console.log(post);
  Post.updateOne({_id: req.params.id}, post) // Update a single post with _id equal to the id passed in the request. Changes specified in the 'post' value passed in
  .then(result => {
    res.status(200).json({
      message: 'Update successful'});
  })
  console.log('Update success!')
});

// All posts GET request
router.get("", (req, res, next) => {
  Post.find() // Find posts in our database. With no filter/criteria it simply returns all posts
  .then(documents => { //'documents' is an array of found Post objects passed into this anonymous function. We return this and a message in our response
    res.status(200).json({
      message: 'Posts fetch successfully',
      posts: documents
    });
  });

});

// Single post GET request using an ID passed through url params
router.get("/:id", (req,res,next) =>{
  Post.findById(req.params.id).then(post =>{ // Find a specific post where ID = req.params.id and return it if found
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  });
});

// Single post DELETE request using an ID passed through url params
router.delete("/:id", (req, res, next) => {
  Post.deleteOne({_id: req.params.id}) // Find a specific post where ID = req.params.id and delete it if found
  .then(result => {
    console.log(result); // Logs some info we don't use, except for a count of the number of items deleted (should always be 1)
    res.status(200).json({message: "Post deleted"});
  });

});

module.exports = router;
