// app/routes.js

module.exports = function(app, passport) {
	// Home page (with login links)
    app.get('/', function(req, res) {
        res.render('index.ejs'); // Load the index.ejs file
    });
    // Login (show the login form)
    app.get('/login', function(req, res) {
        // Render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')}); 
    });
    // Process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // Redirect to the secure profile section
        failureRedirect : '/login', // Redirect back to the signup page if there is an error
        failureFlash : true // Allow flash messages
    }));
    // Signup (show the signup form)
    app.get('/signup', function(req, res) {
        // Render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
    // Process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // Redirect to the secure profile section
        failureRedirect : '/signup', // Redirect back to the signup page if there is an error
        failureFlash : true // Allow flash messages
    }));
    // Profile section
	// We will want this protected so you have to be logged in to visit
    // We will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // Get the user out of session and pass to template
        });
    });
    // Logout
    app.get('/logout', function(req, res) {
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