/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import logger from '../es5/logger';
export interface ActionLogger {
    error(message): void;
    warn(message): void;
    info(message): void;
    verbose(message): void;
    debug(message): void;
    silly(message): void;
    flushLogs(): void;
}

export function getActionLogger(): ActionLogger {
    let cache = [];

    const actionLogger = logger
        .getLevels()
        .map((level) => ({ [level]: (message) => cache.push({ message, level }) }))
        .reduce<ActionLogger>((acc, item) => ({ ...acc, ...item }), {} as ActionLogger);

    const flushLogs = () => {
        cache.forEach(({ message, level }) => {
            logger[level](message);
        });
        cache = [];
    };

    return { ...actionLogger, flushLogs };
}
