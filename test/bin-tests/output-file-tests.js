var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var binRunner = require('./runner');
var defaultListingFile = require('../../src/config').defaults.listingFile;

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
      var testfile = randKey() + '.json';
      try {
        return binRunner(basePath, ['-o', testfile], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          fs.exists(path.join(basePath, defaultListingFile), function(exists) {
            expect(exists).to.equal(false);
            fs.exists(path.join(basePath, testfile), function(innerExists) {
              expect(innerExists).to.equal(true);
              done();
            });
          });
        });
      } catch (err) { done(err); }
    });

  });

});
