var expect = require('chai').expect;

var testUtil = require('./util');

var trimObjectDepth = require('../src/json-writer').trimObjectDepth;

describe('trim-object-depth', function() {

  describe('depth 0', function() {

    it('should reduce to empty obj', function(done) {
      return trimObjectDepth({ children : [] }, 0)
        .then(function(trimmedObject) {
          expect(trimmedObject).to.be.an('object');
          var keys = Object.keys(trimmedObject);
          expect(keys).to.be.an('array');
          expect(keys.length).to.equal(0);
        })
        .then(done)
        .catch(done);
    });

    it('should reduce to single-attribute obj', function(done) {
      var testObj = { children : [] };
      var testAttribute = testUtil.randKey();
      var testValue = testUtil.randKey();
      testObj[testAttribute] = testValue;

      return trimObjectDepth(testObj, 0)
        .then(function(trimmedObject) {
          expect(trimmedObject).to.be.an('object');
          var keys = Object.keys(trimmedObject);
          expect(keys).to.be.an('array');
          expect(keys.length).to.equal(1);
          expect(trimmedObject[testAttribute]).to.equal(testValue);
        })
        .then(done)
        .catch(done);
    });

  });

  describe('depth 1', function() {

    it('should retain empty attribute value', function(done) {

      return trimObjectDepth({ children : [] }, 1)
        .then(function(trimmedObject) {
          expect(trimmedObject).to.be.an('object');
          expect(trimmedObject).to.contain.keys(['children']);
          expect(trimmedObject.children).to.be.an('array');
          expect(trimmedObject.children.length).to.equal(0);
        })
        .then(done)
        .catch(done);

    });

    it('should trim nested object', function(done) {

      var testObject = {
        children : [{
          children : [],
        }],
      };

      return trimObjectDepth(testObject, 1)
        .then(function(trimmedObject) {
          expect(trimmedObject).to.be.an('object');
          expect(trimmedObject).to.contain.keys(['children']);
          expect(trimmedObject.children).to.be.an('array');
          expect(trimmedObject.children.length).to.equal(1);
          var testChild = trimmedObject.children[0];
          expect(testChild).to.be.an('object');
          expect(Object.keys(testChild).length).to.equal(0);
        })
        .then(done)
        .catch(done);

    });

  });

});
