var fs = require('fs');
var path = require('path');

// TODO: Show different kinds of files (symlink, file, etc.)

/**
 * @method dirTree
 * @param {string} filename - path to file to start
 * @param {Object} options - {
 *   @option {bool} isRecursive - should continue into directories
 * }
 * @param {function} callback {
 *   @param {Error}
 *   @param {Object} info
 * }
 */
function dirTree(filename, options, callback) {
  return fs.lstat(filename, function(err, stats) {
    if (err) return callback(err);

    var info = {
      path : filename,
      name : path.basename(filename),
    };

    if (stats.isDirectory()) {
      info.type = 'folder';

      fs.readdir(filename, function(err, children) {
        if (err) return callback(err);

        if (children && children.length > 0) {

          info.children = children
            .map(function(child) {
              return dirTree(filename + '/' + child);
            });

        }

        return callback(null, info);
      });

    } else {
      info.type = 'file';

      return callback(null, info);
    }

  });
}

if (module.parent === undefined || module.parent === null) {
  // node dirTree.js ~/foo/bar
  var util = require('util');

  console.log('base');

  dirTree(process.argv[2], null, function(err, info) {
    console.log(util.inspect(info, false, null));
  });

  console.log('sync end');

}
