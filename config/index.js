'use strict'

const config = {
    // Secret key for JWT signing and encryption
    jwtPassword: 'qwerty098',
    cryptoPassword: 'abc123!@#!'
}

config.databaseUrl = 'postgres://wyyaicazvpdalz:ed47af4a638b60aaa6d60688289292cd16cdf391e6205bc6593828c97e8e75e3@ec2-54-204-0-88.compute-1.amazonaws.com:5432/da624apr3a1k4o'

const resyncDb = 'TRUE'
if(resyncDb.toUpperCase() === 'TRUE') {
    console.log('DB set to resync.')
    config.dbOptions = { force: true }
}
else {
    console.log('DB is not being resynced.')
    config.dbOptions = {}
}

module.exports = config;