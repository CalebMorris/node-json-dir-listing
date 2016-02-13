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

describe('sparse-tests', function() {

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

    var outerDir;
    var innerDir;

    beforeEach(function(done) {
      outerDir = path.join(basePath, randKey());
      return fs.mkdir(outerDir, function(err) {
        if (err) return done(err);
        innerDir = path.join(outerDir, randKey());
        return fs.mkdir(innerDir, function(innerErr) {
          if (innerErr) return done(innerErr);
          return fs.writeFile(path.join(basePath, randKey()), 'test data', done);
        });
      });
    });

    it('should have no children', function(done) {
      try {
        return binRunner(basePath, ['-d', '-s', '0'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(1);
          try {
            var run = JSON.parse(report.stdout);
            expect(run).to.be.an('object');
            expect(run).to.not.contain.keys(['children']);
          } catch (err) { return done(err); }
          expect(report.exitCode).to.equal(0);
          return fs.exists(path.join(basePath, defaultListingFile), function(exists) {
            expect(exists).to.equal(false);
            return done();
          });
        });
      } catch (err) { done(err); }
    });

    it('should have no children', function(done) {
      try {
        return binRunner(basePath, ['-d', '-s', '1'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(1);
          try {
            var run = JSON.parse(report.stdout);
            expect(run).to.be.an('object');
            expect(run).to.contain.keys(['report']);
            expect(run.report).to.contain.keys(['children']);
            expect(run.report.children).to.be.an('array');
            for (var i = 0; i < run.report.children.length; i++) {
              var child = run.report.children[i];
              expect(child).to.be.an('object');
              expect(child).to.not.contain.keys(['children']);
            }
          } catch (err) { return done(err); }
          expect(report.exitCode).to.equal(0);
          return fs.exists(path.join(basePath, defaultListingFile), function(exists) {
            expect(exists).to.equal(false);
            return done();
          });
        });
      } catch (err) { done(err); }
    });

  });

});
