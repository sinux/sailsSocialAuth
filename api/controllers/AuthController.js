/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */

var passport = require('passport');

var executeLogIn = function(config){
    var req = config.req;
    var res = config.res;
    var err = config.err;
    var user = config.user;


};
var AuthController = {

    index: function (req, res) {
        res.view();
    },

    logout: function (req, res) {
        req.logout();
        res.redirect('/');
    },

    signup: function(req, res){
        res.view();
    },
    localCreate: function(req, res){
        var username = req.param("username");
        var password = req.param("password");
        var name = req.param("name");

        var handleAfterCreation = function(err, user){
            sails.log.info('SEM handleAfterCreation err: '+ err + ' user: ' + user);
            if (err){
                res.send(500, { error: "Something wrong happened"});
                return;
            }
            if (user){
                sails.log.info('SEM handleAfterCreation Will try to authenticate');
                req.logout();
                passport.authenticate('local', {successRedirect: '/',failureRedirect: '/signup'})(req, res);
                return;
            }
        };
        var handleCreation = function(err,user){
            if (err){
                sails.log.info('SEM Something wrong happened at user creation, err: '+ err + ' user: ' + user);
                res.send(500, { error: "Something wrong happened"});
                return;
            }
            if (user){
                sails.log.info('SEM user already existed, err: '+ err + ' user: ' + user);
                res.send(400, { user: user, error: "username already existed"});
                return;
            }
            var createDfd = User.create({name: name, username: username, password: password, provider: "local"});
            createDfd.done(handleAfterCreation);
            return;
        };

        var userDfd = User.findOne({username:username});

        userDfd.done(handleCreation);
    },
    'github': function (req, res) {
        passport.authenticate('github', { failureRedirect: '/login' },
            function (err, user) {
                req.logIn(user, function (err) {
                    if (err) {
                        console.log(err);
                        res.view('500');
                        return;
                    }

                    res.redirect('/');
                    return;
                });
            })(req, res);
    },

    'github/callback': function (req, res) {
        passport.authenticate('github',
            function (req, res) {
                res.redirect('/');
            })(req, res);
    },

    'google': function (req, res) {
        passport.authenticate('google', { failureRedirect: '/login', scope:['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.profile'] },
            function (err, user) {
                req.logIn(user, function (err) {
                    if (err) {
                        console.log(err);
                        res.view('500');
                        return;
                    }

                    res.redirect('/');
                    return;
                });
            })(req, res);
    },

    'google/callback': function (req, res) {
        passport.authenticate('google',
            function (req, res) {
                res.redirect('/');
            })(req, res);
    },

    'facebook': function (req, res) {
        passport.authenticate('facebook', {successRedirect: '/',failureRedirect: '/login' },

            function (err, user) {
               req.logIn(user, function (err) {
                   if (err) {
                    console.log(err);
                    res.view('500')
                    return;
                    }

                    res.redirect('/');
                    return;
               });
            })(req,res);
    },

    'facebook/callback': function (req, res) {
        passport.authenticate('facebook',
            function (req, res) {
               res.redirect('/');
            })(req, res);
    },

    'twitter': function (req, res, next) {
        passport.authenticate('twitter', {successRedirect: '/',failureRedirect: '/login' },

            function (err, user) {
               req.logIn(user, function (err) {
                   if (err) {
                    console.log(err);
                    res.view('500')
                    return;
                    }

                    res.redirect('/');
                    return;
               });
            })(req,res,next);
    },

    'twitter/callback': function (req, res) {
        passport.authenticate('twitter',
            function (req, res) {
               res.redirect('/');
            })(req, res);
    },

    'localAuth': function (req, res) {
          passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'})(req, res);
    }

};
module.exports = AuthController;