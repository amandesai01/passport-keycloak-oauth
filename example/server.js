// This code example is borrowed from https://github.com/auth0/passport-linkedin-oauth2/blob/master/example/server.js
// Refer to comments there to get explanation

var express = require('express'),
  passport = require('passport'),
  KeycloakStrategy = require('../lib').Strategy;

const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

var CALLBACK_URL =
  process.env.CALLBACK_URL || 'http://localhost:3000/auth/keycloak/callback';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(
  new KeycloakStrategy(
    {
      clientID: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      realm: 'master',
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      req.session.accessToken = accessToken;
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

// GET /auth/keycloak
app.get(
  '/auth/keycloak',
  passport.authenticate('keycloak', { state: 'SOME STATE' }),
  function (req, res) {
  }
);

// GET /auth/keycloak/callback
app.get(
  '/auth/keycloak/callback',
  passport.authenticate('keycloak', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

var http = require('http');

http.createServer(app).listen(3000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}