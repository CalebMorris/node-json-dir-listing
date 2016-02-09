var assert = require('assert');
var fs = require('fs');
var Promise = require('bluebird');

var writeFile = Promise.promisify(fs.writeFile);

function writeObjectToJSON(filename, obj) {
  return Promise.try(function() {
    assert((typeof filename) === 'string', '`filename` must be a string');
    assert((typeof obj) === 'object', '`obj` must be an object');

    var data = JSON.stringify(obj);

    return writeFile(filename, data);
  });
}

module.exports = writeObjectToJSON;
