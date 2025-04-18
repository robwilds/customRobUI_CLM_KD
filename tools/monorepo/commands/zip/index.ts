/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, ActionLogger, Command, InputParam, Runnable } from '../../../shared/command';

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

@Command({
    name: __filename,
    description: `Create a zip file`,
})
export default class ZipperCommand implements Runnable {
    @InputParam({
        required: true,
        alias: 's',
        title: 'Enter source folder',
    })
    source: string;

    @InputParam({
        required: true,
        alias: 't',
        title: 'Enter target file name path.',
    })
    target: string;

    async run(): Promise<void> {
        await this.createZip();
    }

    @Action({ title: 'Create zip' })
    async createZip(logger?: ActionLogger): Promise<unknown> {
        const source = path.join(process.cwd(), this.source);
        const target = path.join(process.cwd(), this.target);

        logger?.info(`Create ${target} from ${source}`);

        let resolve: (param?: any) => void;
        let reject: (err: any) => void;

        const createZip = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

        const output = fs.createWriteStream(target);
        const zipArchive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            resolve();
        });

        zipArchive.pipe(output);

        zipArchive.directory(source, '');

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        zipArchive.finalize(function (err, _bytes) {
            if (err) {
                logger?.error(
                    `Error while creating zip file
                    ${err}
                    `
                );

                reject(err);
            }
        });

        return createZip;
    }
}
