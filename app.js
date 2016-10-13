// app.js

// Call the packages we need
var express = require('express');
var morgan = require('morgan'); // Logging
var path = require('path'); // Building file paths
var bodyParser = require('body-parser'); // Parsing incoming data
var session = require('express-session'); // Handling cookies
var MongoStore = require('connect-mongo')(session); // Storing cookies in our database
var mongoose = require('mongoose'); // Interfacing with our database
var passport = require('passport'); // Creating and authenticating users
var flash = require('connect-flash'); // Passing messages around in a session

// Load our configuration variables
// We can override the values in config.js using environment variables
var config = require('./config');

var expressPort = process.env.EXPRESS_PORT || config.express.port;

var mongodbUrl = process.env.MONGODB_URL || config.mongodb.url;
var mongodbPort = process.env.MONGODB_PORT || config.mongodb.port;
var mongodbName = process.env.MONGODB_NAME || config.mongodb.name;
var mongodbUser = process.env.MONGODB_USER || config.mongodb.user;
var mongodbPassword = process.env.MONGODB_PASSWORD || config.mongodb.password;

var sessionSecret = process.env.SESSION_SECRET || config.session.secret;

var morganFormat = process.env.MORGAN_FORMAT || config.morgan.format;

// Instantiate our app
var app = express();

// Use native promises (see http://mongoosejs.com/docs/promises.html)
mongoose.Promise = global.Promise;

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

// Connect to our database
mongoose.connect(mongodbUri);

// Configure passport 
require('./passport')(passport); // Pass passport obect for configuration

// Set up our express middleware
app.use(morgan(morganFormat)); // Set up logging
app.use(bodyParser.urlencoded({extended: true})); // We're going to be parsing HTML forms
app.set('view engine', 'ejs'); // Set up ejs for templating
app.use(session({
	secret: sessionSecret,
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
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

