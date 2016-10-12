// app.js

// Call the packages we need
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Set our configuration variables
var config = require('./config');

var expressPort = process.env.EXPRESS_PORT || config.express.port;

var mongodbUrl = process.env.MONGODB_URL || config.mongodb.url;
var mongodbPort = process.env.MONGODB_PORT || config.mongodb.port;
var mongodbName = process.env.MONGODB_NAME || config.mongodb.name;
var mongodbUser = process.env.MONGODB_USER || config.mongodb.user;
var mongodbPassword = process.env.MONGODB_PASSWORD || config.mongodb.password;

var sessionSecret = process.env.SESSION_SECRET || config.session.secret;

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
require('./passport')(passport); // Pass passport for configuration

// Set up our express application
app.use(morgan('dev')); // Log every request to the console
app.use(bodyParser.urlencoded({extended: true})); // We're going to be parsing HTML forms
app.set('view engine', 'ejs'); // Set up ejs for templating

// Required for passport
app.use(session({
	secret: sessionSecret,
	saveUninitialized: true,
	resave: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
})); // Use MongoDB for cookie store since we have it
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions
app.use(flash()); // Use connect-flash for flash messages stored in session
app.use('/static', express.static(path.join(__dirname, 'public')));

// Routes

// Load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport);

// Launch
app.listen(expressPort);
console.log("Server started on port " + expressPort);

