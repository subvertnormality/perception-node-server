'use strict';

const appRoot = require('app-root-path');
const sinon = require('sinon');
const expect = sinon.expect;
const rewire = require('rewire');
const passport = rewire(appRoot + '/lib/passport');
const _ = require('lodash');

describe('Passport authentication', () => {
  const resetRewires = [];
  let userMock;
  let dbMock;

  before(() => {

    dbMock = {
      factory: sinon.stub()
    };

    userMock = {
      find: sinon.stub()
    };
    
    dbMock.factory.withArgs('User').returns(userMock);

    resetRewires.push(passport.__set__('db', dbMock));

  });

  after(() => {
    _.each(resetRewires, _.attempt);
  });

  describe('passportCallback', () => {

    it('when finding user returns error, updates blank user with twitch info and save', () => {



    });

  });


});