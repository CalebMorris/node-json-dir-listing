var crypto = require('crypto');
var fs = require('fs');
var Promise = require('bluebird');

function doesFileExist(filename) {
  return new Promise(function(resolve) {
    fs.exists(filename, function(exists) {
      return resolve(exists);
    });
  });
}

function randKey() {
  return crypto.randomBytes(20).toString('hex');
}

module.exports = {
  doesFileExist : doesFileExist,
  randKey : randKey,
};
