var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var binRunner = require('./runner');

var temp = require('temp').track();

function randKey() {
  return crypto.randomBytes(20).toString('hex');
}

describe('dryrun-tests', function() {

  var basePath;

  beforeEach(function(done) {
    temp.mkdir('test_dir', function(err, dirPath) {
      if (err) return done(err);
      basePath = dirPath;
      done();
    });
  });

  afterEach(function(done) {
    temp.cleanup(function(err, stats) { return err ? done(err) : done(); });
  });

  describe('single dir single file', function() {

    beforeEach(function(done) {
      return fs.mkdir(path.join(basePath, randKey()), function(err) {
        if (err) return done(err);
        return fs.writeFile(path.join(basePath, randKey()), 'test data', done);
      });
    });

    it('should have no listing and stdout', function(done) {
      try {
        return binRunner(basePath, ['-d'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(1);
          try {
            var output = JSON.parse(report.stdout[0]);
            expect(output).to.be.an('object');
          } catch (err) {
            done(err);
          }
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          fs.exists(path.join(basePath, '.listings.json'), function(exists) {
            expect(exists).to.equal(false);
            done();
          });
        });
      } catch (err) { done(err); }
    });

  });

});
