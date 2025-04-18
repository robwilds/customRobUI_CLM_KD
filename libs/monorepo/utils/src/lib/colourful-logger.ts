/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as chalk from 'chalk';
const localChalk = new chalk.Instance({ level: 3 });

interface ColourfulLoggerConfig {
    prefix?: string;
    color?: string;
}

function addColorAndPrefix(out: string, config: ColourfulLoggerConfig) {
    if (config.prefix) {
        let prefix = `[${localChalk.bold(config.prefix)}]`;
        if (config.color && localChalk[config.color]) {
            prefix = localChalk[config.color](prefix);
        }

        out = out
            .split('\n')
            .map((l) => (l.trim().length > 0 ? `${prefix} ${l}` : l))
            .join('\n');
    }

    return out;
}

export const getColourfulLogger = (config: ColourfulLoggerConfig) => {
    const log = (out: string) => process.stdout.write(addColorAndPrefix(out, config));
    log.error = (out: string) =>
        process.stderr.write(addColorAndPrefix(`${localChalk.whiteBright(localChalk.bgRedBright(' error '))} ${out}`, config) + '\n');
    log.ln = (out: string) => process.stdout.write(addColorAndPrefix(out, config) + '\n');

    return log;
};
