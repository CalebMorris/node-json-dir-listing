var path = require('path');
var util = require('util');

var dirTree = require('./dir-tree');
var writeObjectToJSON = require('./json-writer').writeObjectToJSON;

var defaultListingFile = '.listings.json';

function createListings(basePath, options) {
  options = options || {};

  return dirTree(basePath)
    .then(function(pathInfo) {
      var listingFile = path.join(basePath, defaultListingFile);

      if (options.dryrun) {
        return util.format('`%s`: %s', listingFile, JSON.stringify(pathInfo));
      }

      return writeObjectToJSON(listingFile, pathInfo);
    });
}

module.exports = createListings;
