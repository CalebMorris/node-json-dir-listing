var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var testUtil = require('../util');

var binRunner = require('./runner').execRunner;
var defaultListingFile = require('../../src/config').defaults.listingFile;

var temp = require('temp').track();

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
      return fs.mkdir(path.join(basePath, testUtil.randKey()), function(err) {
        if (err) return done(err);
        return fs.writeFile(path.join(basePath, testUtil.randKey()), 'test data', done);
      });
    });

    it('should have no listing and stdout', function(done) {
      return Promise.try(function() {
        var testfile = testUtil.randKey() + '.json';

        return binRunner(basePath, ['-o', testfile])
        .then(function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
          return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
            .then(function(exists) {
              expect(exists).to.equal(false);
              return testUtil.doesFileExist(path.join(basePath, testfile));
            })
            .then(function(innerExists) {
              expect(innerExists).to.equal(true);
            });
        });
      })
      .then(done)
      .catch(done);
    });

  });

});
