var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var mkdir = Promise.promisify(fs.mkdir);
var writeFile = Promise.promisify(fs.writeFile);

var binRunner = require('./runner').execRunner;
var testUtil = require('../util');

var defaultListingFile = require('../../src/config').defaults.listingFile;

var temp = require('temp').track();

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
      return Promise.try(function() {
        outerDir = path.join(basePath, testUtil.randKey());
        return mkdir(outerDir)
          .then(function() {
            innerDir = path.join(outerDir, testUtil.randKey());
            return mkdir(innerDir);
          })
          .then(function() {
            return writeFile(path.join(basePath, testUtil.randKey()), 'test data');
          });
      })
      .then(done)
      .catch(done);
    });

    it('should have no children', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, ['-d', '-s', '0'])
        .then(function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(1);
          var run = JSON.parse(report.stdout);
          expect(run).to.be.an('object');
          expect(run).to.not.contain.keys(['children']);
          return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
            .then(function(exists) {
              expect(exists).to.equal(false);
            });
        });
      })
      .then(done)
      .catch(done);
    });

    it('should have no children', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, ['-d', '-s', '1'])
        .then(function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(1);
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
          return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
            .then(function(exists) {
              expect(exists).to.equal(false);
            });
        });
      })
      .then(done)
      .catch(done);
    });

  });

});
