// passport-setup.js

// Load the local strategy package
var LocalStrategy = require('passport-local').Strategy;

// Load the user model
var User = require('./app/models/user');

// Export the passport config function
module.exports = function(passport) {
    // Set up passport to store user ID in session cookie
    // Serialize the user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    // Deserialize the user
    passport.deserializeUser(function(id, done) {
		console.log("Attempting to deserialize user")
        User.findById(id, function(err, user) {
			if (err) console.log("Database error inside deserializeUser()");
            done(err, user);
        });
    });
    // Signup strategy
    // We are using named strategies since we have multiple strategies
    // By default, if there was no name, it would just be called 'local'
    passport.use('signup-strategy', new LocalStrategy(
		{
        // By default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // Allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) {
			// Asynchronous
			// User.findOne wont fire unless data is sent back
			process.nextTick(function() {
				// Check to see if this email is already in the database
				User.findOne({ 'email' :  email }, function(err, user) {
					// If there are any errors, send an error message
					if (err) {
						console.log("Database error inside findOne() part of signup strategy");
						return done(null, false, req.flash('signupDangerMessage', 'Database error'));
					}
					// Check to see if there is already a user with that email
					if (user) {
						return done(null, false, req.flash('signupDangerMessage', 'That email is already taken'));
					}
					else {
						// If there is no user with that email
						// Create the user
						var newUser = new User();
						// Set the user's credentials
						newUser.email = email;
						newUser.password = newUser.generateHash(password);
						// Save the user in the database
						newUser.save(function(err) {
							// If there are any errors, send an error message
							if (err){
								console.log("Database error inside save() part of signup strategy")
								return done(null, false, req.flash('signupDangerMessage', 'Database error'));
							}
							return done(null, newUser);
						});
					}
				});    
			});
		}
	));
    // Login strategy
    // We are using named strategies since we have multiple strategies
    // By default, if there was no name, it would just be called 'local'
    passport.use('login-strategy', new LocalStrategy(
		{
        // By default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // Allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) {
			// Callback with email and password from our form
			// Try to retrieve user with this email address and check password
			User.findOne({ 'email' :  email }, function(err, user) {
				// If there are any database errors, send an error message
				if (err){
					console.log("Database error inside login strategy");
					return done(null, false, req.flash('loginDangerMessage', 'Database error'));
				}
				// If no user is found, send an error message
				if (!user) {
					return done(null, false, req.flash('loginDangerMessage', 'No user found'));
				}
				// If the user is found but the password is wrong, send an error message
				if (!user.validPassword(password)) {
					return done(null, false, req.flash('loginDangerMessage', 'Oops! Wrong password'));
				}
				// If all is well, return the user
				return done(null, user);
			});
		}
	));
};
