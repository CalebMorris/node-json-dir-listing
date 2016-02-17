var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var binRunner = require('./runner').runner;
var testUtil = require('../util');

var temp = require('temp').track();

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
      return fs.mkdir(path.join(basePath, testUtil.randKey()), function(err) {
        if (err) return done(err);
        return fs.writeFile(path.join(basePath, testUtil.randKey()), 'test data', done);
      });
    });

    it('should have create simple listing file', function(done) {
      return Promise.try(function() {
        return binRunner(basePath, [], function(report) {
          expect(report).to.be.an('object');
          expect(report.path).to.equal(basePath);
          expect(report.exitCode).to.equal(0);
          expect(report.stdout).to.be.an('array');
          expect(report.stdout.length).to.equal(0);
          expect(report.stderr).to.be.an('array');
          expect(report.stderr.length).to.equal(0);
        });
      })
      .then(done)
      .catch(done);
    });

  });

});
