var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var binRunner = require('./runner');

var temp = require('temp').track();

function randKey() {
  return crypto.randomBytes(20).toString('hex');
}

describe('no-options-tests', function() {

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

    it('should have create simple listing file', function(done) {
      try {
        return binRunner(basePath, function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          done();
        });
      } catch (err) { done(err); }
    });

  });

});
