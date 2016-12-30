const nohm = require('nohm').Nohm;

nohm.model('User', {
  properties: {
    name: {
      type: 'string',
      unique: true,
      index: true,
      validations: [
        'notEmpty'
      ]
    },
    displayName: {
      type: 'string',
      unique: false,
      validations: [
        'notEmpty'
      ]
    },
    email: {
      type: 'string',
      unique: false
    },
    logo: {
      type: 'string',
      unique: false
    },
    plays: {
      type: 'integer',
      unique: false,
      defaultValue: 0
    },
    score: {
      type: 'integer',
      unique: false,
      defaultValue: 0
    },
    shame: {
      type: 'integer',
      unique: false,
      defaultValue: 0
    },
    queueJobId: {
      type: 'integer',
      unique: false,
      defaultValue: 0
    },
    queueLastUpdate: {
      type: 'integer',
      unique: false,
      defaultValue: 0
    },
    socketId: {
      type: 'string',
      unique: false
    }
  }
});