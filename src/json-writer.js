var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var writeFile = Promise.promisify(fs.writeFile);

var defaultListingFile = '.listings.json';

function writeObjectToJSON(filename, obj, options) {
  options = options || {};

  console.log('writeObjectToJSON', filename, JSON.stringify(obj))

  return Promise.try(function() {
    assert((typeof filename) === 'string', '`filename` must be a string');
    assert((typeof obj) === 'object', '`obj` must be an object');

    var data = JSON.stringify(obj);

    return writeFile(filename, data)
      .then(function() {
        if (options.recursive && obj.children) {
          return Promise.map(obj.children, function(child) {
            if (child.type === 'folder') {
              return writeObjectToJSON(path.join(child.path, defaultListingFile), child, options);
            }
          });
        }
      });
  });
}

module.exports = {
  writeObjectToJSON : writeObjectToJSON,
};
