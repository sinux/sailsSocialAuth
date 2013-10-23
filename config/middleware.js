var passport = require('passport')
    , GitHubStrategy = require('passport-github').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


var verifyHandler = function (token, tokenSecret, profile, done) {
    sails.log.info("SEM middleware.js verifyHandler Enter");
    process.nextTick(function () {
        console.log(profile);

        sails.log.info("SEM middleware.js verifyHandler nextTick");
        var userUID = parseInt(profile.id);
        User.findOne({uid: userUID}).done(function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                User.create({
                    provider: profile.provider,
                    uid: profile.id,
                    name: profile.displayName,
                    rawResponse: profile
                }).done(function (err, user) {
                    sails.log.info("SEM middleware.js user.create.done");
                    sails.log.info(done);
                    return done(err, user);
                });
            }
        });
    });
};

var localHandler = function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }

      if (!user) {
        sails.log.info("SEM middleware.js localHandler Incorrect username.");
        return done(null, false, { message: 'Incorrect username.' });
      }

      bcrypt.compare(password, user.password, function(err, res) {
        if (err){
            sails.log.info("SEM middleware.js localHandler Incorrect password.");
            return done(null, false, { message: 'Incorrect password.' });
        }
            sails.log.info("SEM middleware.js localHandler Correct password!!.");
            return done(null, user);
      });

    });
};

passport.serializeUser(function (user, done) {
    //done(null, user.uid);
    sails.log.info("SEM middleware.js passport serializeUser");
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    sails.log.info("SEM middleware.js passport deserializeUser");
    User.findOne({id: id}).done(function (err, user) {
        done(err, user)
    });
});


module.exports = {

    // Init custom express middleware
    express: {
        customMiddleware: function (app) {

            passport.use(new GitHubStrategy({
                    clientID: "YOUR_CLIENT_ID",
                    clientSecret: "YOUR_CLIENT_SECRET",
                    callbackURL: "http://localhost:1337/auth/github/callback"
                },
                verifyHandler
            ));

            passport.use(new GoogleStrategy({
                    clientID: 'YOUR_CLIENT_ID',
                    clientSecret: 'YOUR_CLIENT_SECRET',
                    callbackURL: 'http://localhost:1337/auth/google/callback'
                },
                verifyHandler
            ));

            passport.use(new FacebookStrategy({
                    clientID: "YOUR_CLIENT_ID",
                    clientSecret: "YOUR_CLIENT_SECRET",
                    callbackURL: "http://localhost:1337/auth/facebook/callback"
                },
                verifyHandler
            ));

            passport.use(new TwitterStrategy({
                    consumerKey: "YOUR_CLIENT_ID",
                    consumerSecret: "YOUR_CLIENT_SECRET",
                    callbackURL: "http://localhost:1337/auth/twitter/callback"
                },
                verifyHandler
            ));

            passport.use(new LocalStrategy({
                    // Change this if you need a email username field
                    usernameField: 'username',
                    passwordField: 'password'
                },
                localHandler
            ));

            app.use(passport.initialize());
            app.use(passport.session());
        }
    }

};