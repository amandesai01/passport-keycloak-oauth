var util = require("util");
var OAuth2Strategy = require("passport-oauth2");
var InternalOAuthError = require("passport-oauth2").InternalOAuthError;

function Strategy(options, verify) {
  options = options || {};

  options.keycloakBaseURL = options.keycloakBaseURL || "http://localhost:8080";
  options.realm = options.realm || "master";

  if (options.keycloakBaseURL.endsWith('/')) {
    options.keycloakBaseURL = options.keycloakBaseURL.slice(0, -1);
  }

  options.authorizationURL = `${options.keycloakBaseURL}/realms/${options.realm}/protocol/openid-connect/auth`;

  options.tokenURL =
    options.tokenURL ||
    `${options.keycloakBaseURL}/realms/${options.realm}/protocol/openid-connect/token`;
  options.scope = options.scope || ["profile", "email"];

  OAuth2Strategy.call(this, options, verify);

  this.options = options;
  this.name = "keycloak";
  this.introspectionUrl = `${options.keycloakBaseURL}/realms/${options.realm}/protocol/openid-connect/token/introspect`;

  this._oauth2.setAccessTokenName("token");
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token: accessToken,
      client_id: this.options.clientID,
      client_secret: this.options.clientSecret,
    }),
  };

  fetch(this.introspectionUrl, options)
    .then((response) => response.json())
    .then((response) => {
      var profile;
      try {
        profile = {
          provider: "keycloak",
          id: response.sub,
          email: response.email,
          givenName: response.given_name,
          familyName: response.family_name,
          displayName: `${response.given_name} ${response.family_name}`,
          picture: response.picture,
          _json: response,
        };
      } catch (e) {
        return done(
          new InternalOAuthError("failed to parse profile response", e)
        );
      }

      done(null, profile);
    })
    .catch((err) =>
      done(new InternalOAuthError("failed to fetch user profile", err))
    );
};

Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  if (options.state) {
    params["state"] = options.state;
  }
  return params;
};

module.exports = Strategy;
