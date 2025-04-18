/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SecretsOfContext } from '../../../../shared/secrets';

export class VariablesSerializer {
    constructor(private context?: Record<string, any>, private secrets?: SecretsOfContext) {}

    process(variables: Record<string, string | number | boolean | Array<any> | Record<string, any>>, interpret: boolean): string[] {
        return Object.keys(variables).reduce((acc, key) => {
            const value = variables[key];
            if (typeof value === 'string') {
                acc.push(`${key}="${interpret ? this.interpret(value) : value}"`);
            } else if (typeof value === 'boolean') {
                acc.push(`${key}=${value ? 'true' : 'false'}`);
            } else if (typeof value === 'number') {
                acc.push(`${key}=${value}`);
            } else if (typeof value === 'object') {
                acc.push(`${key}="${JSON.stringify(value)}"`);
            }
            return acc;
        }, []);
    }

    private interpret(valueOrPlaceholder: string): string {
        const matches = valueOrPlaceholder.match(/\{(context|secrets)\.([a-zA-Z0-9_]+)\}/g);
        if (matches) {
            matches.forEach((match) => {
                let value: string;
                if (match.includes('{secrets.')) {
                    const variableName = match.replace('{secrets.', '').replace('}', '');
                    value = this.secrets?.get(variableName);
                } else {
                    const variableName = match.replace('{context.', '').replace('}', '');
                    value = this.context?.[variableName];
                }

                if (value) {
                    if (Array.isArray(value)) {
                        valueOrPlaceholder = valueOrPlaceholder.replace(match, JSON.stringify(value));
                    } else {
                        valueOrPlaceholder = valueOrPlaceholder.replace(match, value);
                    }
                } else {
                    throw new MissingContextVariableError(match);
                }
            });
        }
        return valueOrPlaceholder;
    }
}

export class MissingContextVariableError extends Error {
    public appKey: string;
    public contextKey: string;

    constructor(private contextPlaceholder: string) {
        super();
    }

    get message() {
        const variableName = this.contextPlaceholder.replace('{context.', '').replace('}', '');
        return `"${this.contextPlaceholder}" can not be interpreted in "${this.appKey}".
"${this.contextKey}" context doesn't have "${variableName}" property defined.`;
    }
}
