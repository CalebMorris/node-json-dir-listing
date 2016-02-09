var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var temp = require("temp").track();

var dirTree = require('../src/');

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

  describe('empty dir test', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, randKey());
      fs.mkdir(testDir, done);
    });

    it('should have no children', function(done) {

      return dirTree(testDir)
        .then(function(info) {
          expect(info).to.be.an('object');
          expect(info).to.have.keys(['path', 'name', 'type']);
          expect(info).to.not.have.key('children');
        })
        .then(done)
        .catch(done);
    });

  });

  describe('single child dir', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, randKey());
      fs.mkdir(testDir, function(err) {
        if (err) done(err);
        fs.mkdir(path.join(testDir, randKey()), done);
      });
    });

    it('should have no children', function(done) {

      return dirTree(testDir)
        .then(function(info) {
          expect(info).to.be.an('object');
          expect(info).to.have.any.keys(['path', 'name', 'type', 'children']);
          expect(info.children).to.be.an('array');
          expect(info.children.length).to.equal(1);
          var child = info.children[0];
          expect(child).to.be.an('object');
          expect(child).to.have.keys(['path', 'name', 'type']);
        })
        .then(done)
        .catch(done);
    });

  });

  describe('single child file', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, randKey());
      fs.mkdir(testDir, function(err) {
        if (err) done(err);
        fs.writeFile(path.join(testDir, randKey()), 'test', done);
      });
    });

    it('should have no children', function(done) {

      return dirTree(testDir)
        .then(function(info) {
          expect(info).to.be.an('object');
          expect(info).to.have.keys(['path', 'name', 'type', 'children']);
          expect(info.children).to.be.an('array');
          expect(info.children.length).to.equal(1);
          var child = info.children[0];
          expect(child).to.be.an('object');
          expect(child).to.have.keys(['path', 'name', 'type']);
        })
        .then(done)
        .catch(done);
    });

  });

});
