const winston = require('winston');
const { format } = require('logform');
const config = require('config');

const alignedWithColorsAndTime = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);
require('winston-daily-rotate-file');

const transport = new (winston.transports.DailyRotateFile)({
    filename: config.get('logging.filename'),
    datePattern: config.get('logging.datePattern'),
    zippedArchive: config.get('logging.zippedArchive'),
    maxSize: config.get('logging.maxSize'),
    maxFiles: config.get('logging.maxFiles')
});

const logger = winston.createLogger({
    level: config.get('logging.level'),
    format: alignedWithColorsAndTime
});

if (config.get('logging.toConsole')) {
    logger.add(new winston.transports.Console());
}
if (config.get('logging.toFile')) {
    logger.add(transport);
}

module.exports = logger;
