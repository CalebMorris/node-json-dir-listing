var path = require('path');
var util = require('util');

var dirTree = require('./dir-tree');
var writeObjectToJSON = require('./json-writer').writeObjectToJSON;

var defaultListingFile = require('./config').defaults.listingFile;

function createListings(basePath, options) {
  options = options || {};

  return dirTree(basePath)
    .then(function(pathInfo) {
      if (options.output) {
        defaultListingFile = options.output;
      }

      var listingFile = path.join(basePath, defaultListingFile);

      if (options.dryrun) {
        return util.format('%s', JSON.stringify({ listingFile : pathInfo }));
      }

      return writeObjectToJSON(listingFile, pathInfo, options);
    });
}

module.exports = createListings;
