var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var readFile = Promise.promisify(fs.readFile);
var temp = require('temp').track();

var testUtil = require('./util');

var writeObjectToJSON = require('../src/json-writer').writeObjectToJSON;

describe('json-writer-tests', function() {

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

  describe('invalid params test', function() {

    it('should throw error', function(done) {
      return Promise.try(function() {
        return writeObjectToJSON()
          .then(done.bind(null, 'Should fail'))
          .catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.be.an('object');
            expect(err.name).to.equal('AssertionError');
            expect(err.message).to.contain('filename');
          });
      })
      .then(function() {
        return writeObjectToJSON('should fail')
          .then(done.bind(null, 'Should fail'))
          .catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.be.an('object');
            expect(err.name).to.equal('AssertionError');
            expect(err.message).to.contain('obj');
          });
      })
      .then(done)
      .catch(done);
    });

  });

  describe('simple object test', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, testUtil.randKey());
      fs.mkdir(testDir, done);
    });

    it('should write object to file', function(done) {

      var testFile = path.join(testDir, testUtil.randKey());
      var testData = {};
      testData[testUtil.randKey()] = testUtil.randKey();

      return writeObjectToJSON(testFile, testData)
        .then(function() {
          return readFile(testFile, { encoding : 'utf8' })
          .then(function(data) {
            expect(data).to.be.a('string');
            expect(data).to.deep.equal(JSON.stringify(testData));
          });
        })
        .then(done)
        .catch(done);
    });

    it('should write to specified name', function(done) {
      var testFile = path.join(testDir, testUtil.randKey());
      var testData = {};
      var outputKey = testUtil.randKey();
      testData[testUtil.randKey()] = testUtil.randKey();

      return writeObjectToJSON(testFile, testData, { output : outputKey })
        .then(function() {
          return readFile(testFile, { encoding : 'utf8' })
          .then(function(data) {
            expect(data).to.be.a('string');
            expect(data).to.deep.equal(JSON.stringify(testData));
          });
        })
        .then(done)
        .catch(done);
    });

    it('should report and not write', function(done) {
      return Promise.try(function() {
        var testFile = path.join(testDir, testUtil.randKey());
        var testData = {};
        testData[testUtil.randKey()] = testUtil.randKey();

        var reports = [];

        return writeObjectToJSON(testFile, testData, {
          dryrun : true,
          reportDryRunWrite : function(report) { reports.push(report); },
        }).then(function() {
          return testUtil.doesFileExist(testFile)
            .then(function(exists) {
              expect(exists).to.equal(false);
              expect(reports).to.be.an('array');
              expect(reports.length).to.equal(1);
              var report = JSON.parse(reports[0]);
              expect(report).to.be.an('object');
              expect(report.listingFile).to.equal(testFile);
              expect(report.report).to.deep.equal(testData);
            });
        });
      })
      .then(done)
      .catch(done);
    });

    it('should write without reporter callback', function(done) {
      return Promise.try(function() {
        var testFile = path.join(testDir, testUtil.randKey());
        var testData = {};
        testData[testUtil.randKey()] = testUtil.randKey();

        return writeObjectToJSON(testFile, testData, { dryrun : true })
          .then(function() {
            return testUtil.doesFileExist(testFile)
              .then(function(exists) {
                expect(exists).to.equal(true);
              });
          });
      })
      .then(done)
      .catch(done);
    });

    it('should generate sparse report', function(done) {
      return Promise.try(function() {
        var testFile = path.join(testDir, testUtil.randKey());
        var testData = { children : [] };
        testData[testUtil.randKey()] = testUtil.randKey();

        var reports = [];

        return writeObjectToJSON(testFile, testData, {
          sparse : '0',
          dryrun : true,
          reportDryRunWrite : function(report) { reports.push(report); },
        }).then(function() {
          delete testData.children;
          return testUtil.doesFileExist(testFile)
            .then(function(exists) {
              expect(exists).to.equal(false);
              expect(reports).to.be.an('array');
              expect(reports.length).to.equal(1);
              var report = JSON.parse(reports[0]);
              expect(report).to.be.an('object');
              expect(report.listingFile).to.equal(testFile);
              expect(report.report).to.deep.equal(testData);
            });
        });
      })
      .then(done)
      .catch(done);
    });

  });

  describe('deeper tests', function() {

    var dirs = [];

    beforeEach(function(done) {
      return Promise.reduce([testUtil.randKey(), testUtil.randKey(), testUtil.randKey()], function(current, nextKey) {
        var nextDir = path.join(current, nextKey);
        dirs.push(nextDir);
        return new Promise(function(resolve, reject) {
          return fs.mkdir(nextDir, function(err) {
            if (err) return reject(err);
            return resolve(nextDir);
          });
        });
      }, basePath)
      .then(function() { done(); })
      .catch(done);
    });

    it('should create listing at each child dir', function(done) {
      return Promise.try(function() {
        var reports = [];
        var testData = {
          type : 'folder',
          relativePath : dirs[0],
          children : [{
            type : 'folder',
            relativePath : dirs[1],
            children : [],
          }],
        };

        return writeObjectToJSON(dirs[0], testData, {
          sparse : '0',
          recursive : true,
          dryrun : true,
          reportDryRunWrite : function(report) { reports.push(report); },
        }).then(function() {
          expect(reports).to.be.an('array');
          expect(reports.length).to.equal(2);
        });
      })
      .then(done)
      .catch(done);
    });

  });

});
