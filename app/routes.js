// app/routes.js

module.exports = function(app, passport) {
	// Home page (with login links)
    app.get('/', function(req, res) {
		console.log("GET /: req.session");
		console.log(req.session);
		console.log("GET /: req.user");
		console.log(req.user);
        res.render('index.ejs'); // Load the index.ejs file
    });
    // Login (show the login form)
    app.get('/login', function(req, res) {
		console.log("GET /login: req.session");
		console.log(req.session);
		console.log("GET /login: req.user");
		console.log(req.user);
        // Render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')}); 
    });
    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/list', // Redirect to the secure section
        failureRedirect : '/login', // Redirect back to the signup page if there is an error
        failureFlash : true // Allow flash messages
    }));
    // Signup (show the signup form)
    app.get('/signup', function(req, res) {
		console.log("GET /signup: req.session");
		console.log(req.session);
		console.log("GET /signup: req.user");
		console.log(req.user);
        // Render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/list', // Redirect to the secure section
        failureRedirect : '/signup', // Redirect back to the signup page if there is an error
        failureFlash : true // Allow flash messages
    }));
    // Secure section
	// We will want this protected so you have to be logged in to visit
    // We will use route middleware to verify this (the isLoggedIn function)
    app.get('/list', isLoggedIn, function(req, res) {
		console.log("GET /list: req.session");
		console.log(req.session);
		console.log("GET /list: req.user");
		console.log(req.user);
        res.render('list.ejs', {
            user : req.user // Get the user out of session and pass to template
        });
    });
    app.get('/api/movielists', isLoggedInApi, function(req, res) {
		console.log("GET /api/movielists: req.session");
		console.log(req.session);
		console.log("GET api/movielists: req.user");
		console.log(req.user);
        res.json({movieList: req.user.local.movieList});
    });
    app.post('/api/movielists', isLoggedInApi, function(req, res) {
		console.log("POST /api/movielists: req.session");
		console.log(req.session);
		console.log("POST api/movielists: req.user");
		console.log(req.user);
		console.log("POST api/movielists: req.body")
		console.log(req.body)
        req.user.local.movieList = req.body.movieList;
		req.user.save(function(err) {
			if (err) throw err;
		});
        res.json({movieList: req.user.local.movieList});
    });
    // Logout
    app.get('/logout', function(req, res) {
		console.log("GET /logout: req.session");
		console.log(req.session);
		console.log("GET /logout: req.user");
		console.log(req.user);
        req.logout();
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
    // If they aren't, redirect them to the home page
    res.json({message: "User not authenticated"});
}