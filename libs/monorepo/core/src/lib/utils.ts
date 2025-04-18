/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readJsonFile<T = Record<string, any>>(filePath: string): T {
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

export function getWorkspaceVersion(): string {
    const json = getWorkspacePackageJson();
    return json.version;
}

export function getWorkspacePackageJson(): Record<string, any> {
    const packagePath = join(process.cwd(), 'package.json');
    return readJsonFile(packagePath);
}
