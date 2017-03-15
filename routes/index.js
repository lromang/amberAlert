var express  = require('express');
var passport = require('passport');
var expressSession = require('express-session');
var flash    = require('connect-flash');
var bCrypt   = require('bcrypt-nodejs');
var LocalStrategy  = require('passport-local').Strategy;
var path     = require('path');
var pgp      = require('pg-promise');
var router   = express.Router();
var db;


// Configure Passport
router.use(expressSession({secret: 'mySecretKey', resave : false , saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());

// Store messages in session and displaying templates.
router.use(flash());

// Login
passport.use('login', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        // check in postgres if a user with username exists or not
        db.oneOrNone('select * from usuarios where usuario = $1', [ username ]).then(function (user) {
            // session

            if (!user){
                console.log('User Not Found with username '+username);
                return done(null, false, req.flash('message', 'Usuario no registrado'));
            }

            if (!isValidPassword(user ,password)){
                console.log('Invalid password');
                return done(null, false, req.flash('message', 'Contraseña no válida')); // redirect back to login page
            }

            return done(null,user);
        }).catch(function (error) {
            console.log(error);
            return done(error);
        });
    }
));

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.contrasena);
};


// Passport needs to be able to serialize and deserialize users to support persistent login sessions
passport.serializeUser(function(user, done) {
    console.log('serializing user: ');
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.one(' select * from usuarios where id = $1',[
        id
    ]).then(function (user) {
        done (null, user);
    }).catch(function (error) {
        done(error);
        console.log(error);
    });
});

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};

var isNotAuthenticated = function (req, res, next) {
    if (req.isUnauthenticated())
        return next();
    res.redirect('/principal');
};


// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

/* Exec */

// Login post
router.post('/login', passport.authenticate('login', {
    successRedirect: '/principal',
    failureRedirect:'/',
    failureFlash : true
}));

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
    successRedirect: '/principal',
    failureRedirect: '/',
    failureFlash : true
}));

/* Handle Logout */
router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});


/* GET login page. */
router.get('/', isNotAuthenticated, function(req, res, next) {
    res.render('login', { title: '', message : req.flash('message') });
});

router.get('/principal', isAuthenticated, function (req, res) {
    res.render('principal', { title: 'Tienda', user: req.user, section: 'principal'});
});

module.exports =  router;