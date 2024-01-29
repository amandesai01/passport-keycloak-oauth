A simple [Passport](http://passportjs.org/) strategy for using [Keycloak](https://www.keycloak.org/) as IDP using OAuth2.

## Install

```
npm install passport-keycloak-oauth2
```

## Usage

Register the strategy

```javascript
var KeycloakStrategy = require('passport-keycloak-oauth2').Strategy;

passport.use(
  new KeycloakStrategy(
    {
      real: 'master',
      keycloakBaseURL: 'http://localhost:8080',
      clientID: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECREY,
      callbackURL: 'http://127.0.0.1:3000/auth/keycloak/callback',
      scope: ['email', 'profile'],
    },
    function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the Keycloak account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  )
);
```

and then authenticate as:

```javascript
app.get(
  '/auth/keycloak',
  passport.authenticate('keycloak', { state: 'SOME STATE' }),
  function (req, res) {
    // The request will be redirected to Keycloak for authentication, so this
    // function will not be called.
  }
);
```

the login callback:

```javascript
app.get(
  '/auth/keycloak/callback',
  passport.authenticate('keycloak', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);
```

See [this](https://www.keycloak.org/docs/23.0.5/securing_apps/#_oidc) for details on Keycloak API.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. You can send me an email on amandesai01@gmail.com.


## License

This project is licensed under the MIT license.
