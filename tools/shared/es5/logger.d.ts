/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @typescript-eslint/no-shadow */
declare namespace Logger {
    const enum LogLevel {
        error = 'error',
        warn = 'warn',
        info = 'info',
        verbose = 'verbose',
        debug = 'debug',
        silly = 'silly',
    }

    let level: LogLevel;

    function getLevels(): LogLevel[];
    function error(message: any): void;
    function warn(message: any): void;
    function info(message: any): void;
    function verbose(message: any): void;
    function debug(message: any): void;
    function silly(message: any): void;

    export interface Logger {
        level: LogLevel;
        error(message: any): void;
        warn(message: any): void;
        info(message: any): void;
        verbose(message: any): void;
        debug(message: any): void;
        silly(message: any): void;
    }
}

export = Logger;
