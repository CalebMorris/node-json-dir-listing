var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var writeFile = Promise.promisify(fs.writeFile);

var listingFile = require('./config').defaults.listingFile;

function writeObjectToJSON(filename, obj, options) {

  return Promise.try(function() {
    assert((typeof filename) === 'string', '`filename` must be a string');
    assert((typeof obj) === 'object', '`obj` must be an object');

    options = options || {};

    var data = JSON.stringify(obj);

    if (options.output) {
      listingFile = options.output;
    }

    return writeFile(filename, data)
      .then(function() {
        if (options.recursive && obj.children) {
          return Promise.map(obj.children, function(child) {
            if (child.type === 'folder') {
              return writeObjectToJSON(path.join(child.path, listingFile), child, options);
            }
          });
        }
      });
  });
}

module.exports = {
  writeObjectToJSON : writeObjectToJSON,
};
