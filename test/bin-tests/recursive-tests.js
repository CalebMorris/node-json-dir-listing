var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var mkdir = Promise.promisify(fs.mkdir);
var writeFile = Promise.promisify(fs.writeFile);

var binRunner = require('./runner');
var testUtil = require('../util');
var defaultListingFile = require('../../src/config').defaults.listingFile;

var temp = require('temp').track();

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
      return Promise.try(function() {
        secondaryPath = path.join(basePath, testUtil.randKey());
        trinaryPath = path.join(secondaryPath, testUtil.randKey());

        return mkdir(secondaryPath)
          .then(function() {
            return mkdir(trinaryPath);
          })
          .then(function() {
            return writeFile(path.join(trinaryPath, testUtil.randKey()), 'test data');
          });
      })
      .then(done)
      .catch(done);
    });

    it('should have two listings', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, ['-R'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
            .then(function(exists) {
              expect(exists).to.equal(true);
              return testUtil.doesFileExist(path.join(secondaryPath, defaultListingFile));
            })
            .then(function(innerExists) {
              expect(innerExists).to.equal(true);
            });
        });
      })
      .then(done)
      .catch(done);
    });

    it('should report two listings', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, ['-R', '-d'], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(3, JSON.stringify(report.stdout));
          var baseFiles = [ trinaryPath, secondaryPath, basePath ];
          for (var i = 0; i < report.stdout.length; i++) {
            var dryrunReport;
            try {
              dryrunReport = JSON.parse(report.stdout[i]);
            } catch (err) {
              expect.fail(null, null, 'Failed to parse json: ' + report.stdout[i]);
            }
            expect(dryrunReport).to.be.an('object');
            expect(dryrunReport.listingFile).to.equal(path.join(baseFiles[i], defaultListingFile));
          }
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
            .then(function(exists) {
              expect(exists).to.equal(false);
              return testUtil.doesFileExist(path.join(secondaryPath, defaultListingFile));
            })
            .then(function(innerExists) {
              expect(innerExists).to.equal(false);
            });
        });
      })
      .then(done)
      .catch(done);
    });

  });

});
