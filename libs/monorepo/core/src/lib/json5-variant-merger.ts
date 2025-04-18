/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'path';
import * as merge from 'deepmerge';
import * as JSON5 from 'json5';
import { existsSync, readFileSync } from 'fs';

export const VARIANT_ENV_KEY = 'SETENV_OVERRIDE';

export class Json5VariantMerger {
    static read(directoryPath: string, fileBaseName: string, defaultVariantName = ''): Record<string, any> | null {
        const variantsToLoad = [defaultVariantName];

        if (process.env.CI) {
            variantsToLoad.push('ci');
        }

        if (process.env.VARIANT_ENV_KEY) {
            variantsToLoad.push(process.env.VARIANT_ENV_KEY);
        }

        const object = variantsToLoad.reduce((acc, variant) => {
            const path = resolve(directoryPath, `${fileBaseName}${variant ? `.${variant}` : ''}.json5`);

            if (existsSync(path)) {
                const variableVariants = JSON5.parse(readFileSync(path, 'utf8'));
                return merge(acc, variableVariants);
            }

            return acc;
        }, {} as Record<string, any> | null);

        return Object.keys(object).length ? object : null;
    }
}
