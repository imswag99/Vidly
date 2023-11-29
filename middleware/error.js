const winston = require('winston');


module.exports = function (err, req, res, next) {

    // const myLogger = winston.createLogger({
    //     level: 'error'
    // });
    winston.error(err.message, err);

    // error
    // warn
    // info
    // verbose
    // debug
    // silly

    res.status(500).send('Something failed.');
}