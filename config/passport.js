var passport = require('passport');
var User = require("../models/user.js");
var LocalStrategy = require('passport-local').Strategy;

//tells passport how to store the user in the session
passport.serializeUser(function(user, next) {
    next(null, user.id)
});

passport.deserializeUser(function(id, next) {
    User.findById(id, function(err, user) {
        next(err, user);
    });
});

//signup strategy
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, next) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(error => {
            messages.push(error.msg);
        });
        return next(null, false, req.flash('error', messages))
    }
    // check if user exists
    User.findOne({'email': email}, function(err, user){
        if(err){
            console.log(err)
            return next(err);   
        }
        if(user){
            //user already exists -- send flash message
            return next(null, false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
            newUser.email = email;
            newUser.password = newUser.encryptPassword(password);
            newUser.save(function(err, result){
                if(err){
                    console.log("user err")
                    return next(err);
                }
                return next(null, newUser);
            })
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, next) {
    //Check Errors
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(error => {
            messages.push(error.msg);
        });
        return next(null, false, req.flash('error', messages))
    }
    
    //Find User
    User.findOne({'email': email}, function(err, user){
        if (err){
            return next(err);   
        }
        if (!user){
            //user already exists -- send flash message
            return next(null, false, {message: 'No user found.'});
        }
        if (!user.validPassword(password)) {
            return next(null, false, {message: 'Incorrect Password'});
        }
        
        return next(null, user)
    });
}))