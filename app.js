// app.js

// Call the packages we need
var express = require('express');
var morgan = require('morgan'); // Logging
var path = require('path'); // Building file paths
var bodyParser = require('body-parser'); // Parsing incoming data
var session = require('express-session'); // Handling cookies
// Use memory store until we can figure out how to handle database errors more gracefully
// var MongoStore = require('connect-mongo')(session); // Storing cookies in our database
var mongoose = require('mongoose'); // Interfacing with our database
var passport = require('passport'); // Creating and authenticating users
var flash = require('connect-flash'); // Passing messages around in a session
var URI = require('urijs'); // Creating and manipulating URIs

// Load our configuration variables
// We can override the values in config.js using environment variables
var config = require('./config');
var settingsGroup = process.env.SETTINGS_GROUP || config.settingsGroup;
var expressPort = process.env.EXPRESS_PORT || config[settingsGroup].express.port;
var mongodbURIelements = process.env.MONGODB_URICOMPONENTS || config[settingsGroup].mongodb.URIelements;
var mongodbConnectOptions = process.env.MONGODB_CONNECTOPTIONS || config[settingsGroup].mongodb.connectOptions;
var sessionSecret = process.env.SESSION_SECRET || config[settingsGroup].session.secret;
var morganFormat = process.env.MORGAN_FORMAT || config[settingsGroup].morgan.format;

// Instantiate our app
var app = express();

// Use native promises (see http://mongoosejs.com/docs/promises.html)
mongoose.Promise = global.Promise;

// Construct the MongoDB URI
var mongodbURI = new URI(mongodbURIelements).toString();
console.log("MongoDB URI: " + mongodbURI);

// Connect to our database
mongoose.connect(mongodbURI, mongodbConnectOptions);

mongoose.connection.on('open', function () {  
  console.log("Mongoose open event"); 
});

mongoose.connection.on('close', function () {  
  console.log("Mongoose close event"); 
});

mongoose.connection.on('connected', function () {  
  console.log("Mongoose connected event");
}); 


mongoose.connection.on('disconnected', function () {  
  console.log("Mongoose disconnected event"); 
});

mongoose.connection.on('error',function (err) {  
  console.log("Mongoose error event:");
  console.log(err)
}); 



// Configure passport 
require('./passport')(passport); // Pass passport obect for configuration

// Set up our express middleware
app.use(morgan(morganFormat)); // Set up logging
app.use(bodyParser.urlencoded({extended: true})); // We're going to be parsing HTML forms
app.set('view engine', 'ejs'); // Set up ejs for templating
app.use(session({
	secret: sessionSecret,
	saveUninitialized: true,
	resave: true
	// Use memory store until we can figure out how to handle database errors more gracefully
	// store: new MongoStore({ mongooseConnection: mongoose.connection })
})); // Create sessions and store cookies in MongoDB
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Enable passport to write user ID into cookies
app.use(flash()); // Use connect-flash for flash messages stored in session
app.use('/static', express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Routes

// Load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport);

// Launch
app.listen(expressPort);
console.log("Server started on port " + expressPort);