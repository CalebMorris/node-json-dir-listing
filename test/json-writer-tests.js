var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var Promise = require('bluebird');

var readFile = Promise.promisify(fs.readFile);

var temp = require("temp").track();

var writeObjectToJSON = require('../src/json-writer');

function randKey() {
  return crypto.randomBytes(20).toString('hex');
}

describe('dirTreeTests', function() {

  var basePath;

  beforeEach(function(done) {
    temp.mkdir('test_dir', function(err, dirPath) {
      if (err) return done(err);
      basePath = dirPath;
      done();
    });
  });

  afterEach(function(done) {
    temp.cleanup(function(err, stats) { err ? done(err) : done(); });
  });

  after(function(done) {
    temp.cleanup(function(err, stats) { err ? done(err) : done(); });
  })

  describe('invalid params test', function() {

    it('should throw error', function(done) {
      return writeObjectToJSON()
        .then(done.bind(null, 'Should fail'))
        .catch(function(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an('object');
          expect(err.name).to.equal('AssertionError');
          expect(err.message).to.contain('filename');
          done();
        })
        .catch(done);

      return writeObjectToJSON('should fail')
        .then(done.bind(null, 'Should fail'))
        .catch(function(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.be.an('object');
          expect(err.name).to.equal('AssertionError');
          expect(err.message).to.contain('obj');
          done();
        })
        .catch(done);
    });

  });

  describe('simple object test', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, randKey());
      fs.mkdir(testDir, done);
    });

    it('should write object to file', function(done) {

      var testFile = path.join(testDir, randKey());
      var testData = {};
      testData[randKey()] = randKey();

      return writeObjectToJSON(testFile, testData)
        .then(function() {
          return readFile(testFile, { encoding: 'utf8' })
          .then(function(data) {
            expect(data).to.be.a('string');
            expect(data).to.deep.equal(JSON.stringify(testData));
          });
        })
        .then(done)
        .catch(done);
    });

  });

});
