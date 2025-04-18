/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum TaskRedirectionMode {
    BACK = 'back',
    WORKSPACE = 'workspace',
    MESSAGE = 'message',
    URL = 'url',
    QUERY = 'query',
}

export interface TaskVariablesQueryParams {
    maxItems?: number;
    skipCount?: number;
    sort?: string;
}

export interface TaskVariablesModel {
    list: {
        entries: [
            {
                entry: {
                    appName: string;
                    serviceName: string;
                    serviceFullName: string;
                    serviceType: string;
                    serviceVersion: string;
                    appVersion: string;
                    taskId: string;
                    taskVariable: true;
                    processInstanceId: string;
                    name: string;
                    value: any;
                    type: string;
                };
            }
        ];
        pagination: {
            skipCount: number;
            maxItems: number;
            count: number;
            hasMoreItems: boolean;
            totalItems: number;
        };
    };
}
