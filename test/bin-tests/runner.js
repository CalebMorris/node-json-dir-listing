var spawn = require('child_process').spawn;

function runner(dirPath, callback) {
  var jsonDirListing = spawn('node', ['./bin/index.js', dirPath]);

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

module.exports = runner;
