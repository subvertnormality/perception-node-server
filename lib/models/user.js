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
            unique: true,
            validations: [
                'email'
            ]
        },
        logo: {
            type: 'string',
            unique: false
        },
        plays: {
            type: 'integer',
            unique: false,
            defaultValue: 0
        }
    }
});