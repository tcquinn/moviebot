// app/models/user.js

// Load the packages we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define the schema for our user model
var userSchema = mongoose.Schema({
	email: String,
	password: String,
	movieList: [String]
});

// Generate a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Create the model for users and export it to our app
module.exports = mongoose.model('User', userSchema);