// app.js

// Call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Set our configuration variables
var config = require('./config');
var expressPort = process.env.EXPRESS_PORT || config.express.port; // Set our port for Express
var mongodbUrl = process.env.MONGODB_URL || config.mongodb.url;
var mongodbPort = process.env.MONGODB_PORT || config.mongodb.port;
var mongodbName = process.env.MONGODB_NAME || config.mongodb.name;
var mongodbUser = process.env.MONGODB_USER || config.mongodb.user;
var mongodbPassword = process.env.MONGODB_PASSWORD || config.mongodb.password;

// Construct the MongoDB URI
var mongodbUri = (
	"mongodb://" +
	mongodbUser +
	":" +
	mongodbPassword +
	"@" +
	mongodbUrl +
	":" +
	mongodbPort +
	"/" +
	mongodbName
)

// Get our model
var Movie = require('./app/models/movie');

// Instantiate our app
var app = express();

// Configure app to use bodyParser
// This will let us get data from POST

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

 // Use native promises (see http://mongoosejs.com/docs/promises.html)
mongoose.Promise = global.Promise;

// Connect to our database
mongoose.connect(mongodbUri);

// Routes

var router = express.Router(); // Get an instance of the express Router

// Middleware to use for all requests

router.use(function(req, res, next) {
	// Do logging
	console.log('Request received.');
	next();
});

// Test route to make sure everything is working (accessed at GET http://localhost:8080/api)

router.get('/', function(req, res) {
	res.json({message: "Hooray! Welcome to our API!"});
});

// Routes that end in /movies

router.route('/movies')
	// Create a movie (accessed at POST http://localhost:8080/api/movies)
	.post(function(req, res) {
		var movie = new Movie();
		movie.movieID = req.body.movieID;
		// Save the movie and check for errors
		movie.save(function(err){
			if (err) res.send(err);
			res.json({message: 'Movie created.'});
		});
	})
	// Get all the movies (accessed at GET http://localhost:8080/api/movies)
	.get(function(req, res) {
		Movie.find(function(err, movies) {
			if (err) res.send(err);
			res.json(movies);
		});
	});

// On routes that end in /movies/:mongoID

router.route('/movies/:mongoID')
	// Get the movie with that mongoID (accessed at GET http://localhost:8080/api/movies/:mongoID)
	.get(function(req, res) {
		Movie.findById(req.params.mongoID, function(err, movie) {
			if (err) res.send(err);
			res.json(movie);
		});
	})
	// Update the movie with this mongoID (accessed at PUT http://localhost:8080/api/movies/:mongoID)
	.put(function(req, res) {
		// Use our movie model to find the movie we want
		Movie.findById(req.params.mongoID, function(err, movie) {
			if (err) res.send(err);
			movie.movieID = req.body.movieID;
			// Save the movie
			movie.save(function(err) {
				if (err) res.send(err);
				res.json({message: 'Movie updated.'});
;			});
		});
	})
	// Delete the movie with this mongoID (accessed at DELETE http://localhost:8080/api/movies/:mongoID)
	.delete(function(req, res) {
		Movie.remove({
			_id: req.params.mongoID
		}, function (err, bear) {
			if (err) res.send(err);
			res.json({message: 'Successfully deleted.'});
		});
	});
	
// Register our routes

// All of our routes will be prefixed with /api

app.use('/api', router);

// Start the server

app.listen(expressPort);
console.log("Server started on port " + expressPort);

