/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';

export interface PackageLockJsonV3 {
    packages: {
        [key: string]: {
            version: string;
            resolved?: string;
        };
    };
}

export function getProjectPackageJson(projectPath: string): any {
    const packageJsonPath = join(process.cwd(), projectPath, 'package.json');
    return getJson(packageJsonPath);
}

export function getPackageLockJson(): PackageLockJsonV3 {
    const packageLockJsonPath = join(process.cwd(), 'package-lock.json');
    return getJson(packageLockJsonPath);
}

export function getProjectNgPackageJson(projectPath: string): any {
    const packageJsonPath = join(process.cwd(), projectPath, 'ng-package.json');
    return getJson(packageJsonPath);
}

export function getProjectTarget(): any {
    const angularJsonPath = join(process.cwd(), 'project-target.json');
    return getJson(angularJsonPath);
}

export function getJson(jsonPath: string): any {
    if (require.cache[jsonPath]) {
        delete require.cache[jsonPath];
    }
    const json = require(jsonPath);

    return json;
}

export function moveFile(fileName: string, targetFolder: string): void {
    const packageNamePath = join(process.cwd(), fileName);
    execFileSync('mv', [packageNamePath, targetFolder]);
}

export function copyFile(from: string | string[], to: string | string[]): void {
    if (!Array.isArray(from)) {
        from = [from];
    }
    if (!Array.isArray(to)) {
        to = [to];
    }
    const fromFolder = join(process.cwd(), ...from);
    const toFolder = join(process.cwd(), ...to);
    cpSync(fromFolder, toFolder, { recursive: true });
}

export function createFolder(folderName: string | string[]): string {
    if (!Array.isArray(folderName)) {
        folderName = [folderName];
    }
    const localPackagesFolderPath = join(process.cwd(), ...folderName);
    mkdirSync(localPackagesFolderPath, { recursive: true });

    return localPackagesFolderPath;
}
