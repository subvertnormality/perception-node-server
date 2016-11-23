'use strict';

const appRoot = require('app-root-path');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const rewire = require('rewire');
const passport = rewire(appRoot + '/lib/passport');
const db = require(appRoot + '/lib/db');
const _ = require('lodash');

chai.use(sinonChai);

describe('Passport authentication', () => {
  const resetRewires = [];
  let user;
  let userFindStub;
  let userSaveSpy;
  let dbMock;
  let profileMock;
  let passportCallback;

  before(() => {
    dbMock = {
      factory: sinon.stub()
    };

    user = db.factory('User');

    profileMock = {
      _json: {
        name: 'test_name',
        display_name: 'test_display_name',
        email: 'test_email',
        logo: 'test_logo'
      }
    }
    
    userFindStub = sinon.stub(user, 'find');
    userSaveSpy = sinon.spy(user, 'save');
    dbMock.factory.returns(user);
    
    resetRewires.push(passport.__set__('db', dbMock));
    passportCallback = (passport.__get__('passportCallback'));

  });

  after(() => {
    _.each(resetRewires, _.attempt);
    user.save.restore();
  });

  describe('passportCallback', () => {

    it('when finding user returns error, updates blank user with twitch info and save', () => {

      let doneSpy = sinon.spy();

      userFindStub.withArgs({name: 'test_name'}).yields(new Error('error'));

      passportCallback('', '', profileMock, doneSpy);

      expect(userSaveSpy).to.have.been.called;
      expect(doneSpy).to.have.been.calledWith(null, user);

    });

  });


});