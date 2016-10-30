// app/routes.js

// Load the user model
var User = require('../app/models/user');

module.exports = function(app, passport) {
	// Home page
    app.get('/', function(req, res) {
		// Render index.ejs, passing in any flash data, and send
        res.render('index.ejs', {
			dangerMessage: req.flash('homeDangerMessage'),
			warningMessage: req.flash('homeWarningMessage'),
			infoMessage: req.flash('homeInfoMessage'),
			successMessage: req.flash('homeSuccessMessage')
		});
    });
    // Login page
    app.get('/login', function(req, res) {
        // Render login.ejs, passing in any flash data, and send
        res.render('login.ejs', {
			dangerMessage: req.flash('loginDangerMessage'),
			warningMessage: req.flash('loginWarningMessage'),
			infoMessage: req.flash('loginInfoMessage'),
			successMessage: req.flash('loginSuccessMessage')			
		}); 
    });
    // Process the login form using passport
    app.post('/login', passport.authenticate('login-strategy', {
        successRedirect : '/list', // If success, redirect to the secure section
        failureRedirect : '/login', // If failure, redirect back to the signup page
        failureFlash : true // Allow flash messages
    }));
    // Signup page
    app.get('/signup', function(req, res) {
        // Render signup.ejs, passing in any flash data, and send
        res.render('signup.ejs', {
			dangerMessage: req.flash('signupDangerMessage'),
			warningMessage: req.flash('signupWarningMessage'),
			infoMessage: req.flash('signupInfoMessage'),
			successMessage: req.flash('signupSuccessMessage')			
		});
    });
    // Process the signup form using passport
    app.post('/signup', passport.authenticate('signup-strategy', {
        successRedirect : '/list', // If success, redirect to the secure section
        failureRedirect : '/signup', // If failure, redirect back to the signup page
        failureFlash : true // Allow flash messages
    }));
    // Movie list page
    // We use route middleware to verify that the user is logged in
    app.get('/list', isLoggedIn, function(req, res) {
       // Render list.ejs, passing in any flash data, and send
        res.render('list.ejs', {
            user : req.user, // Get the user out of session and pass to template
 			dangerMessage: req.flash('listDangerMessage'),
			warningMessage: req.flash('listWarningMessage'),
			infoMessage: req.flash('listInfoMessage'),
			successMessage: req.flash('listSuccessMessage')
       });
    });
	// API to pass movie lists between client and server
	// We use route middleware to verify that the user is logged in
	// Allow the client to fetch the movie list from the server for this user
    app.get('/api/movielists', isLoggedInApi, function(req, res) {
		// Check to make sure the movieList is in the session
		if(!req.user.movieList) {
			res.status(404);
			res.json({message: "Data not in session"});
		}
		// Send the movie list
		console.log("Sending movie list");
        res.json({movieList: req.user.movieList});
    });
	// Allow the client to save the movie list to the server for this user
    app.post('/api/movielists', isLoggedInApi, function(req, res) {
        req.user.movieList = req.body.movieList;
		// Save the movie list
		req.user.save(function(err) {
			if (err) {
				res.status(500);
				res.json({message: "Database error"})
			}
		});
		// Return the object we just saved
        res.json({movieList: req.user.movieList});
    });
    // Change password page
    // We use route middleware to verify that the user is logged in
    app.get('/changepassword', isLoggedIn, function(req, res) {
        // Render changepassword.ejs, passing in any flash data, and send
        res.render('changepassword.ejs', {
            user : req.user, // Get the user out of session and pass to template
			dangerMessage: req.flash('changepasswordDangerMessage'),
			warningMessage: req.flash('changepasswordWarningMessage'),
			infoMessage: req.flash('changepasswordInfoMessage'),
			successMessage: req.flash('changepasswordSuccessMessage')			
		});
    });
    // Process the change password form
    app.post('/changepassword', isLoggedIn, function(req, res, next) {
		if (req.body.newPassword !== req.body.confirmNewPassword) {
			req.flash('changepasswordDangerMessage', "New passwords don't match");
			res.redirect('/changepassword');
		}
		else {
			req.user.password = req.user.generateHash(req.body.newPassword);
			req.user.save(function(err) {
				if (err) {
					req.flash('changepasswordDangerMessage', "Database error");
					res.redirect('/changepassword');
				}
				else {
					req.flash('listSuccessMessage', "Password successfully changed");
					res.redirect('/list');
				}
			});
		}
	});
    // Delete account page
    // We use route middleware to verify that the user is logged in
    app.get('/deleteaccount', isLoggedIn, function(req, res) {
        // Render deleteaccount.ejs, passing in any flash data, and send
        res.render('deleteaccount.ejs', {
            user : req.user, // Get the user out of session and pass to template
			dangerMessage: req.flash('deleteaccountDangerMessage'),
			warningMessage: req.flash('deleteaccountWarningMessage'),
			infoMessage: req.flash('deleteaccountInfoMessage'),
			successMessage: req.flash('deleteaccountSuccessMessage')			
		});
    });
    // Process the delete account button
    app.post('/deleteaccount', isLoggedIn, function(req, res, next) {
		User.findByIdAndRemove(req.user.id, function(err) {
			if (err) {
				req.flash('deleteaccountDangerMessage', "Database error");
				res.redirect('/deleteaccount');
			}
			else {
				req.flash('homeSuccessMessage', "Account successfully deleted");
				req.logout();
				res.redirect('/');
			}
		});
	});
    // Logout
    app.get('/logout', function(req, res) {
        req.logout();
		// Send the user back to the home page
        res.redirect('/');
    });
};

// Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // If user is authenticated in the session, carry on 
    if (req.isAuthenticated()) return next();
    // If they aren't, redirect them to the home page
	req.flash('homeDangerMessage', "Authentication error");
    res.redirect('/');
}

function isLoggedInApi(req, res, next) {
    // If user is authenticated in the session, carry on 
    if (req.isAuthenticated()) return next();
    // If they aren't, return an error message
	res.status(403);
    res.json({message: "User not authenticated"});
}