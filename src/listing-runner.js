var path = require('path');

var dirTree = require('./dir-tree');
var writeObjectToJSON = require('./json-writer').writeObjectToJSON;

var defaultListingFile = require('./config').defaults.listingFile;

function createListings(basePath, options) {
  options = options || {};

  var dryRunReports = [];

  return dirTree(basePath)
    .then(function(pathInfo) {
      if (options.output) {
        defaultListingFile = options.output;
      }

      options.reportDryRunWrite = function(report) {
        dryRunReports.push(report);
      };

      var listingFile = path.join(basePath, defaultListingFile);

      return writeObjectToJSON(listingFile, pathInfo, options);
    })
    .then(function() {
      return dryRunReports;
    });
}

module.exports = createListings;
