const mongoose = require('mongoose'); // Mongoose allows us to create Schemas to define data objects. Lovely strutured data in an inherently unstructured database <3

// Here we define our schema for how Posts should look in the database
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: false }, // Need to reflect our frontend, where a caption isn't neccessary
  imagePath: { type: String, required: true },
  filters: { type: String, required: false }
});

module.exports = mongoose.model('Post', postSchema);
