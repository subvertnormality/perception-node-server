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
  let userLoadStub;
  let dbMock;
  let profileMock;
  let passportCallback;
  let deserializeUser;

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
    userLoadStub = sinon.stub(user, 'load');
    dbMock.factory.returns(user);
    
    resetRewires.push(passport.__set__('db', dbMock));
    passportCallback = (passport.__get__('passportCallback'));
    deserializeUser = (passport.__get__('deserializeUser'));
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

    it('when finding user returns no ids, updates blank user with twitch info and save', () => {

      let doneSpy = sinon.spy();

      userFindStub.withArgs({name: 'test_name'}).yields(null, []);

      passportCallback('', '', profileMock, doneSpy);

      expect(userSaveSpy).to.have.been.called;
      expect(doneSpy).to.have.been.calledWith(null, user);

    });

    it('when finding user returns an ids but nothing exists in the DB, update blank user with twitch info and save', () => {

      let doneSpy = sinon.spy();
      const id = '1';

      userFindStub.withArgs({name: 'test_name'}).yields(null, [id]);
      userLoadStub.withArgs(id).yields(new Error('test'));

      passportCallback('', '', profileMock, doneSpy);

      expect(userSaveSpy).to.have.been.called;
      expect(doneSpy).to.have.been.calledWith(null, user);

    });

    it('when finding user returns an existing user, update user with latest twitch info and latest custom data and save', () => {

      let doneSpy = sinon.spy();
      const id = '1';
      const properties = {
        plays: 11
      };

      userFindStub.withArgs({name: 'test_name'}).yields(null, [id]);
      userLoadStub.withArgs(id).yields(null, properties);

      passportCallback('', '', profileMock, doneSpy);

      expect(userSaveSpy).to.have.been.called;
      expect(doneSpy).to.have.been.calledWith(null, user);

    });

  });

  describe('deserializeUser', () => {

    it('passes error if user find errors', function() {
      const name = 'test_name';
      let doneSpy = sinon.spy();
      userFindStub.withArgs({name: name}).yields(new Error('test'), [1]);

      deserializeUser(name, doneSpy);

      expect(doneSpy).to.be.calledWith(new Error('Could not deserialise user'));
    });

    it('errors if user cannot be found', function() {
      const name = 'test_name';
      let doneSpy = sinon.spy();
      userFindStub.withArgs({name: name}).yields(null, []);

      deserializeUser(name, doneSpy);

      expect(doneSpy).to.be.calledWith(new Error('Could not deserialise user'));
    });

    it('passes error through if user load errors when passed an id', function() {
      const name = 'test_name';
      let doneSpy = sinon.spy();
      const id = 1;
      const testError = new Error('test');

      userFindStub.withArgs({name: name}).yields(null, [id, 2]);
      userLoadStub.withArgs(id).yields(testError);

      deserializeUser(name, doneSpy);

      expect(doneSpy).to.be.calledWith(testError);
    });

    it('passes error through on successful load', function() {
      const name = 'test_name';
      let doneSpy = sinon.spy();
      const id = 1;
      const testError = new Error('test');

      userFindStub.withArgs({name: name}).yields(null, [id, 2]);
      userLoadStub.withArgs(id).yields(null, {});

      deserializeUser(name, doneSpy);

      expect(doneSpy).to.be.calledWith(null, user);
    });
  });
});