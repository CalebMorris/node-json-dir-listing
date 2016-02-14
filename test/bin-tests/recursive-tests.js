var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var binRunner = require('./runner');
var defaultListingFile = require('../../src/config').defaults.listingFile;

var temp = require('temp').track();

function randKey() {
  return crypto.randomBytes(20).toString('hex');
}

describe('recursive-tests', function() {

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

  describe('dir file child dir', function() {

    var secondaryPath;
    var trinaryPath;

    beforeEach(function(done) {
      secondaryPath = path.join(basePath, randKey());
      trinaryPath = path.join(secondaryPath, randKey());
      return fs.mkdir(secondaryPath, function(err) {
        if (err) return done(err);
        return fs.mkdir(trinaryPath, function(innerErr) {
          if (innerErr) return done(innerErr);
          return fs.writeFile(path.join(basePath, randKey()), 'test data', done);
        });
      });
    });

    it('should have two listings', function(done) {
      try {
        return binRunner(basePath, ['-R'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          return fs.exists(path.join(basePath, defaultListingFile), function(exists) {
            expect(exists).to.equal(true);
            return fs.exists(path.join(secondaryPath, defaultListingFile), function(innerExists) {
              expect(innerExists).to.equal(true);
              done();
            });
          });
        });
      } catch (err) { done(err); }
    });

    it('should report two listings', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, ['-R', '-d'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          var baseFiles = [
            trinaryPath,
            secondaryPath,
            basePath,
          ];
          for (var i = 0; i < report.stdout.length; i++) {
            var dryrunReport = JSON.parse(report.stdout[i]);
            expect(dryrunReport).to.be.an('object');
            expect(dryrunReport.listingFile).to.equal(path.join(baseFiles[i], defaultListingFile));
          }
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          return fs.exists(path.join(basePath, defaultListingFile), function(exists) {
            expect(exists).to.equal(false);
            return fs.exists(path.join(secondaryPath, defaultListingFile), function(innerExists) {
              expect(innerExists).to.equal(false);
              done();
            });
          });
        });
      })
      .catch(done);
    });

  });

});
