/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RuleContext, RuleParameter } from '@alfresco/adf-extensions';

export function filesAreOfType(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFile) {
                return false;
            }

            return evaluateRule(node.entry.nodeType, args);
        });
    }

    return false;
}

export function foldersAreOfType(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFolder) {
                return false;
            }

            return evaluateRule(node.entry.nodeType, args);
        });
    }

    return false;
}

export function currentFolderIsOfType(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.navigation?.currentFolder?.name) {
        return evaluateRule(context.navigation.currentFolder.nodeType, args);
    }

    return false;
}

export function filesHaveAspect(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFile) {
                return false;
            }

            return evaluateRule(node.entry.aspectNames, [...args, { type: 'operator', value: 'contains' }]);
        });
    }
    return false;
}

export function foldersHaveAspect(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFolder) {
                return false;
            }

            return evaluateRule(node.entry.aspectNames, [...args, { type: 'operator', value: 'contains' }]);
        });
    }
    return false;
}

export function currentFolderHasAspect(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.navigation?.currentFolder?.name) {
        return evaluateRule(context.navigation.currentFolder.aspectNames, [...args, { type: 'operator', value: 'contains' }]);
    }

    return false;
}

export function fileNames(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFile) {
                return false;
            }

            return evaluateRule(node.entry.name, args);
        });
    }

    return false;
}

export function folderNames(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFolder) {
                return false;
            }

            return evaluateRule(node.entry.name, args);
        });
    }

    return false;
}

export function currentFolderName(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.navigation?.currentFolder?.name) {
        return evaluateRule(context.navigation.currentFolder.name, args);
    }

    return false;
}

export function filesHavePropertyWithValue(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFile || !node.entry.properties) {
                return false;
            }

            const propertyName = args.find((arg) => arg.type === 'argument')?.value;
            if (propertyName) {
                return evaluateRule(node.entry.properties[propertyName], args);
            } else {
                return false;
            }
        });
    }
    return false;
}

export function folderHavePropertyWithValue(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.selection?.nodes) {
        return context.selection.nodes.every((node) => {
            if (!node.entry.isFolder || !node.entry.properties) {
                return false;
            }

            const propertyName = args.find((arg) => arg.type === 'argument')?.value;
            if (propertyName) {
                return evaluateRule(node.entry.properties[propertyName], args);
            } else {
                return false;
            }
        });
    }
    return false;
}

export function currentFolderHasPropertyWithValue(context: RuleContext, ...args: RuleParameter[]): boolean {
    if (context?.navigation?.currentFolder?.name) {
        const propertyName = args.find((arg) => arg.type === 'argument')?.value;
        if (propertyName) {
            return evaluateRule(context.navigation.currentFolder.properties[propertyName], args);
        } else {
            return false;
        }
    }
    return false;
}

function evaluateRule(target: any, args: RuleParameter[]) {
    const operator = args.find((arg) => arg.type === 'operator')?.value;
    const value = args.find((arg) => arg.type === 'value')?.value;

    try {
        switch (operator) {
            case 'equals':
                return JSON.stringify(target, null, 0) === JSON.stringify(value, null, 0);
            case 'greaterThan':
                return target > value;
            case 'greaterThanOrEqual':
                return target >= value;
            case 'lessThan':
                return target < value;
            case 'lessThanOrEqual':
                return target <= value;
            case 'contains':
                if (target.constructor === Array) {
                    return target.some((arg) => JSON.stringify(arg, null, 0) === JSON.stringify(value, null, 0));
                } else if (typeof target === 'string') {
                    return target.indexOf(value) >= 0;
                } else {
                    return JSON.stringify(target, null, 0).indexOf(JSON.stringify(value, null, 0)) >= 0;
                }
            case 'matches': {
                let regex: RegExp;
                if (typeof value === 'string') {
                    let valueRegex = value;
                    if (value.startsWith('/') && !value.startsWith('//')) {
                        valueRegex = valueRegex.substr(1);
                    }
                    if (value.endsWith('/') && !value.endsWith('//')) {
                        valueRegex = valueRegex.substr(0, valueRegex.length - 1);
                    }
                    regex = new RegExp(valueRegex);
                } else {
                    regex = value;
                }
                return regex.test(target);
            }
            default:
                return JSON.stringify(target, null, 0) === JSON.stringify(value, null, 0);
        }
    } catch (error) {
        return false;
    }
}
