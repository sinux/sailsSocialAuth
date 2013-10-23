/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */
var bcrypt = require('bcrypt');

module.exports = {

    adapter: 'mongo',

    attributes  : {
        provider: 'STRING',
        uid: 'FLOAT',
        name: 'STRING',
        displayName: 'STRING',
        username: 'STRING',
        password: 'STRING',
        emailConfirmationStatus: {
          type: 'STRING',
          defaultsTo: 'UNCONFIRMED'
        },
        rawResponse: 'JSON'
    },

    // Lifecycle Callbacks
    beforeCreate: function(values, next) {
      if (values.provider && values.provider === "local"){
        bcrypt.hash(values.password, 10, function(err, hash) {
          if(err) return next(err);
          values.password = hash;
          next();
        });
      }else{
        next();
      }
   }

};
