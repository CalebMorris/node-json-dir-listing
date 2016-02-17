var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var lstat = Promise.promisify(fs.lstat);
var readdir = Promise.promisify(fs.readdir);

// TODO: Show different kinds of files (symlink, file, etc.)

/**
 * @method dirTree
 * @param {string} filename - path to file to start
 * @return {Promise} Returns promise of an info object
 */
function dirTree(filename, options) {
  options = options || {};
  return lstat(filename)
    .then(function(stats) {
      var filepath = options.basepath ? path.relative(options.basepath, filename) : filename;
      var info = {
        path : filepath,
        relativePath : filename,
        name : path.basename(filename),
      };

      if (stats.isDirectory()) {
        info.type = 'folder';

        return readdir(filename)
          .then(function(children) {
            if (children && children.length > 0) {

              return Promise.map(children, function(child) {
                return dirTree(filename + '/' + child, options);
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
