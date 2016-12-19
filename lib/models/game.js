const nohm = require('nohm').Nohm;

nohm.model('Game', {
  properties: {
    name: {
      type: 'string',
      unique: true,
      validations: [
        'notEmpty'
      ]
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
    round: {
      type: 'json',
      unique: false,
      defaultValue: {
        roundType: 'default',
        configuration: [1, 2, 3, 0, 0, 0]
      }
    }
  }
});