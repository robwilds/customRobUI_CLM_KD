/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken } from '@angular/core';

export const AppIdentifiers = {
    HxPStudio: 'hxps-modeling',
    HxPAdmin: 'hxps-admin',
    HxPWorkspace: 'hxps-workspace',
    APAModeling: 'apa-modeling',
    APAAdmin: 'apa-admin',
    APAWorkspace: 'apa-workspace',
} as const;

export type AppIdentifiers = typeof AppIdentifiers[keyof typeof AppIdentifiers];

export const APP_IDENTIFIER = new InjectionToken<AppIdentifiers>('APP_IDENTIFIER');

export function provideAppId(identifier: AppIdentifiers) {
    return { provide: APP_IDENTIFIER, useValue: identifier };
}
