var exec = require('child_process').exec;
var Promise = require('bluebird');

function execRunner(dirPath, flags) {
  return new Promise(function(resolve, reject) {
    var command = ['node', './bin/index.js'].concat(flags).concat(dirPath).join(' ');
    return exec(command, function(err, stdout, stderr) {
      if (err) return reject(err);

      var report = {
        path : dirPath,
        stdout : stdout.split('\n')
          .filter(function(x) { return x !== ''; })
          .filter(function(x) { return !!x; }),
        stderr : stderr.split('\n')
          .filter(function(x) { return x !== ''; })
          .filter(function(x) { return !!x; }),
      };

      return resolve(report);
    });
  });
}

module.exports = {
  execRunner : execRunner,
};
