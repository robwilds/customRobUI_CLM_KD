/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const { createLogger, transports, format } = require('winston');
const { yellow, green, red, blue, magenta, cyan } = require('chalk');

const levels = {
    error: red,
    warn: yellow,
    info: cyan,
    verbose: magenta,
    debug: green,
    silly: blue
};

const myFormat = format.printf(({ level, message }) => {
    return levels[level](message)
});

const logger = createLogger({
    level: 'silly',
    format: format.combine(
        // format.splat(),
        format.timestamp(),
        format.prettyPrint(),
        myFormat
    ),
    transports: [
        new transports.Console(),
    ]
});

logger.getLevels = () => Object.keys(levels);
module.exports = logger;
