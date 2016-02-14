var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var temp = require('temp').track();

var testUtil = require('./util');

var dirTree = require('../src/dir-tree');

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
    temp.cleanup(function(err, stats) { return err ? done(err) : done(); });
  });

  after(function(done) {
    temp.cleanup(function(err, stats) { return err ? done(err) : done(); });
  });

  describe('empty dir test', function() {

    var testDir;

    beforeEach(function(done) {
      testDir = path.join(basePath, testUtil.randKey());
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
      testDir = path.join(basePath, testUtil.randKey());
      fs.mkdir(testDir, function(err) {
        if (err) done(err);
        fs.mkdir(path.join(testDir, testUtil.randKey()), done);
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
      testDir = path.join(basePath, testUtil.randKey());
      fs.mkdir(testDir, function(err) {
        if (err) done(err);
        fs.writeFile(path.join(testDir, testUtil.randKey()), 'test', done);
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
