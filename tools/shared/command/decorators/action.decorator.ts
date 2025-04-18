/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import ora from 'ora';
import { getActionLogger } from '../action-logger';

export interface ActionParams {
    title: string;
    error?: string;
    success?: string;
}

export type Spinner = ora.Ora;

export function ActionDecorator(spinnerMessages?: ActionParams) {
    return function (target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const title = spinnerMessages.title.replace(/#\{(\d)\}/g, (match, p1) => args[p1] ?? match);

            target.__spinner?.stop();
            target.__spinner = ora(title) as ora.Ora;
            target.__spinner.start();

            const actionLogger = getActionLogger();

            try {
                const returnValue = await originalMethod.apply(this, [...args, actionLogger, target.__spinner]);
                target.__spinner.succeed(spinnerMessages.success ?? `${title}, done`);
                actionLogger.flushLogs();
                return returnValue;
            } catch (error) {
                target.__spinner.fail(spinnerMessages.error ?? `${title}, failed`);
                actionLogger.flushLogs();
                throw error;
            }
        };
    };
}
