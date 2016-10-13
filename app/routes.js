// app/routes.js

module.exports = function(app, passport) {
	// Home page (with login links)
    app.get('/', function(req, res) {
		console.log("GET /: req.session");
		console.log(req.session);
		console.log("GET /: req.user");
		console.log(req.user);
		// Render index.ejs and send
        res.render('index.ejs');
    });
    // Login (show the login form)
    app.get('/login', function(req, res) {
		console.log("GET /login: req.session");
		console.log(req.session);
		console.log("GET /login: req.user");
		console.log(req.user);
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
		console.log("GET /signup: req.session");
		console.log(req.session);
		console.log("GET /signup: req.user");
		console.log(req.user);
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
		console.log("GET /list: req.session");
		console.log(req.session);
		console.log("GET /list: req.user");
		console.log(req.user);
        res.render('list.ejs', {
            user : req.user // Get the user out of session and pass to template
        });
    });
	// Secure API to pass movie list between client and server
	// We use route middleware to verify that the user is logged in
	// Allow the client to fetch the movie list from the server for this user
    app.get('/api/movielists', isLoggedInApi, function(req, res) {
		console.log("GET /api/movielists: req.session");
		console.log(req.session);
		console.log("GET api/movielists: req.user");
		console.log(req.user);
		// Send the movie list
        res.json({movieList: req.user.local.movieList});
    });
	// Allow the client to save the movie list to the server for this user
    app.post('/api/movielists', isLoggedInApi, function(req, res) {
		console.log("POST /api/movielists: req.session");
		console.log(req.session);
		console.log("POST api/movielists: req.user");
		console.log(req.user);
		console.log("POST api/movielists: req.body")
		console.log(req.body)
        req.user.local.movieList = req.body.movieList;
		// Save the movie list
		req.user.save(function(err) {
			if (err) {
				console.log("Inside callback function of POST /api/movielists");
				console.log("Error occurred when attempting req.user.save");
				console.log("err:");
				console.log(err);
				console.log("Throwing err")
				throw err;
			}
		});
		// Return the object we just saved
        res.json({movieList: req.user.local.movieList});
    });
    // Logout
    app.get('/logout', function(req, res) {
		console.log("GET /logout: req.session");
		console.log(req.session);
		console.log("GET /logout: req.user");
		console.log(req.user);
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
    res.json({message: "User not authenticated"});
}