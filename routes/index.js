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
    function(req, username, password, done){
    db.oneOrNone('select * from usuarios where usuario = $1', [username]).then(function(user){
      if(!user){
        console.log('User not found with username: ' + username);
        return done(null, false, req.flash('message', 'Usuario no registrado'));
      }
      if(!isValidPassword(user, password)){
        console.log('Password not valid');
        return done(null, false, req.flash('message', 'Contraseña no válida'));
      }
      return done(null, user);
    }).catch(function(error){
      console.log(error);
      return done(error);
    });
    }
));


// Check if a password is valid.
var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.contrasena);
}


//  Serialize and deserialize users.
passport.serializeUser(function(user, done){
  console.log('serializing user: ');
  console.log(user);
  done(nulll, user.id);
});

passport.deserializeUser(function(id, done){
  db.one('select * from usuarios where id = $1',  [
      id
  ]).then(function(user){
    done(null, user);
  }).catch(function (error){
    done(error);
    console.log(error);
  })
});

// Verify if user is authenticated
var isAuthenticated = function(req, res, next){
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

// Verify is user is not authenticated
var isNotAuthenitcated = function(req, res, next){
  if(req.isUnauthenticated())
    return next();
  res.redirect('/principal');
}

// Generate hash using bCrypt
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}


/* Exec */

// Login post
router.post('/login', passport.authenticate('login', {
    succesRedirect: '/principal',
    failureRedirect:'/',
    failureFlash : true
}));

// Logout post
router.post('/signout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Get login
router.get('/', isNotAuthenitcated, function(req, res, next){
  res.render('login', {title: '', message: req.flash('message')});
});

// Get Principal
router.get('/principal', isAuthenticated, function(req, res){
  res.render('principal', {title: 'alert', user: req.user, section: 'principal'});
});