// app/routes.js

module.exports = function(app, passport) {
	// Home page (with login links)
    app.get('/', function(req, res) {
		// Render index.ejs and send
        res.render('index.ejs');
    });
    // Login (show the login form)
    app.get('/login', function(req, res) {
        // Render login.ejs, pass in any flash data, and send
        res.render('login.ejs', {message: req.flash('loginMessage')}); 
    });
    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/list', // If success, redirect to the secure section
        failureRedirect : '/login', // If failure, redirect back to the signup page
        failureFlash : true // Allow flash messages
    }));
    // Signup (show the signup form)
    app.get('/signup', function(req, res) {
        // Render signup.ejs, pass in any flash data, and send
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/list', // If success, redirect to the secure section
        failureRedirect : '/signup', // If failure, redirect back to the signup page
        failureFlash : true // Allow flash messages
    }));
    // Secure page
    // We use route middleware to verify that the user is logged in
    app.get('/list', isLoggedIn, function(req, res) {
        res.render('list.ejs', {
            user : req.user // Get the user out of session and pass to template
        });
    });
	// Secure API to pass movie list between client and server
	// We use route middleware to verify that the user is logged in
	// Allow the client to fetch the movie list from the server for this user
    app.get('/api/movielists', isLoggedInApi, function(req, res) {
		// Check to make sure the movieList is in the session
		if(!req.user.local.movieList) {
			res.status(404);
			res.json({message: "Data not in session"});
		}
		// Send the movie list
        res.json({movieList: req.user.local.movieList});
    });
	// Allow the client to save the movie list to the server for this user
    app.post('/api/movielists', isLoggedInApi, function(req, res) {
        req.user.local.movieList = req.body.movieList;
		// Save the movie list
		req.user.save(function(err) {
			if (err) {
				console.log("Database error inside save API");
				res.status(500);
				res.json({message: "Database error"})
			}
		});
		// Return the object we just saved
        res.json({movieList: req.user.local.movieList});
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
    res.redirect('/');
}

function isLoggedInApi(req, res, next) {
    // If user is authenticated in the session, carry on 
    if (req.isAuthenticated()) return next();
    // If they aren't, return an error message
	res.status(403);
    res.json({message: "User not authenticated"});
}