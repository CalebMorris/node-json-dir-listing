var path = require('path');

var dirTree = require('./dir-tree');
var writeObjectToJSON = require('./json-writer').writeObjectToJSON;

var defaultListingFile = '.listings.json';

function createListings(basePath, options) {
  options = options || {};

  return dirTree(basePath)
    .then(function(pathInfo) {
      return writeObjectToJSON(path.join(basePath, defaultListingFile), pathInfo);
    });
}

module.exports = createListings;
