// passport.js

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
        User.findById(id, function(err, user) {
			if (err) {
				console.log("Database error inside deserializeUser()");
				// We return done(null, false) to avoid upstream problems
				// If we return done(err) or done(null), the upstream code doesn't handle gracefully
				// Resulting error goes all the way to the user's screen
				return done(null, false);
			};
            done(err, user);
        });
    });
    // Signup strategy
    // We are using named strategies since we have one for login and one for signup
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
					// If there are any errors, return the error
					if (err) {
						console.log("Database error inside findOne() part of signup strategy");
						// We return null in the error argument to avoid upstream problems
						// If we return err, the upstream code doesn't handle gracefully
						// The resulting error goes all the way to the user's screen
						return done(null, false, req.flash('signupMessage', 'Database error.'));
					}
					// Check to see if there is already a user with that email
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
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
							if (err){
								console.log("Database error inside save() part of signup strategy")
								// We return null in the error argument to avoid upstream problems
								// If we return err, the upstream code doesn't handle gracefully
								// The resulting error goes all the way to the user's screen
								return done(null, false, req.flash('signupMessage', 'Database error.'));
							}
							return done(null, newUser);
						});
					}
				});    
			});
		}
	));
    // Login strategy
    // We are using named strategies since we have one for login and one for signup
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
				// If there are any errors, return the error before anything else
				if (err){
					console.log("Database error inside login strategy");
					// We return null in the error argument to avoid upstream problems
					// If we return err, the upstream code doesn't handle gracefully
					// The resulting error goes all the way to the user's screen
					return done(null, false, req.flash('loginMessage', 'Database error.'));
				}
				// If no user is found, return an error
				if (!user) {
					return done(null, false, req.flash('loginMessage', 'No user found.'));
				}
				// If the user is found but the password is wrong, return an error
				if (!user.validPassword(password)) {
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
				}
				// If all is well, return the user
				return done(null, user);
			});
		}
	));
};
