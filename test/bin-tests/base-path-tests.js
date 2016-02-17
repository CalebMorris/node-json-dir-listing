var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var binRunner = require('./runner').execRunner;
var defaultListingFile = require('../../src/config').defaults.listingFile;
var testUtil = require('../util');

var temp = require('temp').track();

describe('base-path-tests', function() {

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
      return binRunner(basePath, ['-d', '-b', basePath + '/..'])
      .then(function(report) {
        expect(report).to.be.an('object');
        expect(report.path).to.equal(basePath);
        var output = JSON.parse(report.stdout);
        expect(output).to.be.an('object');
        expect(output).to.contain.keys(['report']);
        expect(output.report.path).to.equal(path.basename(basePath));
        expect(report.stderr).to.equal('');
        return testUtil.doesFileExist(path.join(basePath, defaultListingFile))
          .then(function(exists) {
            expect(exists).to.equal(false);
          });
      })
      .then(done)
      .catch(done);
    });

  });

});
