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
 * @return {Promise} Returns promise of an info object
 */
function dirTree(filename, options) {
  options = options || {};

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

            }

            return info;
          });

      }

      info.type = 'file';

      return info;
    });
}

module.exports = dirTree;
