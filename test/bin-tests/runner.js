var spawn = require('child_process').spawn;

function runner(dirPath, flags, callback) {
  var params = ['./bin/index.js'].concat(flags).concat(dirPath);
  var jsonDirListing = spawn('node', params);

  var stdoutSet = [];
  var stderrSet = [];

  jsonDirListing.stdout.on('data', function(data) {
    var buff = new Buffer(data);
    stdoutSet.push(buff.toString('utf8'));
  });

  jsonDirListing.stderr.on('data', function(data) {
    var buff = new Buffer(data);
    stderrSet.push(buff.toString('utf8'));
  });

  jsonDirListing.on('close', function(code) {
    var report = {
      path : dirPath,
      exitCode : code,
      stdout : stdoutSet,
      stderr : stderrSet,
    };

    return callback(report);
  });
}

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
  runner : runner,
  execRunner : execRunner,
};
