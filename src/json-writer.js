var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var util = require('util');

var writeFile = Promise.promisify(fs.writeFile);

var listingFile = require('./config').defaults.listingFile;

function trimObjectDepth(trimmableObject, depth) {
  return Promise.try(function() {
    if (depth === 0) {
      delete trimmableObject.children;
      return trimmableObject;
    }

    return Promise.map(trimmableObject.children, function(child) {
      return trimObjectDepth(child, depth - 1);
    })
      .then(function(updatedChildren) {
        trimmableObject.children = updatedChildren;
        return trimmableObject;
      });
  });
}

function dryRunShim(filename, obj, options) {
  return Promise.try(function() {
    if (options.dryrun) {
      return util.format('%s', JSON.stringify({ report : obj, listingFile : filename }));
    }
    return writeFile(filename, JSON.stringify(obj));
  });
}

function writeObjectToJSON(filename, obj, options) {

  return Promise.try(function() {
    assert((typeof filename) === 'string', '`filename` must be a string');
    assert((typeof obj) === 'object', '`obj` must be an object');

    options = options || {};

    if (options.output) {
      listingFile = options.output;
    }

    var basePromise = Promise.resolve();

    if (options.recursive && obj.children) {
      basePromise = basePromise.then(function() {
        return Promise.map(obj.children, function(child) {
          if (child.type === 'folder') {
            return writeObjectToJSON(path.join(child.path, listingFile), child, options);
          }
        });
      });
    }

    return basePromise.then(function() {
      if (options.sparse === null || options.sparse === undefined) {
        return dryRunShim(filename, obj, options);
      }

      return trimObjectDepth(obj, Math.max(+options.sparse, 0))
        .then(function(normalizedData) {
          return dryRunShim(filename, normalizedData, options);
        });
    });
  });
}

module.exports = {
  writeObjectToJSON : writeObjectToJSON,
  trimObjectDepth : trimObjectDepth,
};
