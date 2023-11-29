require('express-async-errors');
const winston = require('winston');
// require('winston-mongodb');

module.exports = function() {
    process.on('uncaughtException', (ex) => {
        console.log('WE GOT AN UNCAUGHT EXCEPTION');
        winston.error(ex.message, ex);
        process.exit(1);
    });
    
    winston.add(new winston.transports.Console());
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    // winston.add(new winston.transports.MongoDB({ db: 'mongodb://127.0.0.1/vidly' }));
    
    
    // throw new Error("Something failed during startup");
    // const p = Promise.reject('Something failed miserably!')
    // p.then(() => console.log('Done'))
}