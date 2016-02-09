var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var lstat = Promise.promisify(fs.lstat);
var readdir = Promise.promisify(fs.readdir);

// TODO: Show different kinds of files (symlink, file, etc.)

/**
 * @method dirTree
 * @param {string} filename - path to file to start
 * @param {Object} options - {
 *   @option {bool} isRecursive - should continue into directories
 * }
 * @return {Promise}
 */
function dirTree(filename, options, callback) {
  return lstat(filename)
    .then(function(stats) {
      var info = {
        path : filename,
        name : path.basename(filename),
      };

      if (stats.isDirectory()) {
        info.type = 'folder';

        return readdir(filename)
          .then(function(children) {
            if (children && children.length > 0) {

              return Promise.map(children, function(child) {
                return dirTree(filename + '/' + child);
              }).then(function(resolvedChildren) {
                info.children = resolvedChildren;

                return info;
              });

            } else {
              return info;
            }
          });

      } else {
        info.type = 'file';

        return info;
      }
    });
}

if (module.parent === undefined || module.parent === null) {
  // node dirTree.js ~/foo/bar
  var util = require('util');

  console.log('base');

  var basePath = process.argv[2];

  return dirTree(basePath)
    .then(function(info) {
      console.log('info', info);
    })
    .catch(function(err) {
      console.error('failed to load path', basePath, err.stack);
    })

  console.log('sync end');

}
