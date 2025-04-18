/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable max-lines */

import { RuleContext } from '@alfresco/adf-extensions';

export const contextWithFiles: RuleContext = {
    repository: undefined,
    auth: undefined,
    navigation: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    selection: {
        count: 2,
        isEmpty: false,
        libraries: undefined,
        nodes: [
            {
                entry: {
                    id: 'node1',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: true,
                    isFolder: false,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock1.txt',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
            {
                entry: {
                    id: 'node2',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: true,
                    isFolder: false,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock2.txt',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
        ],
    },
};

export const contextWithFiles2: RuleContext = {
    repository: undefined,
    auth: undefined,
    navigation: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    selection: {
        count: 2,
        isEmpty: false,
        libraries: undefined,
        nodes: [
            {
                entry: {
                    id: 'node1',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: true,
                    isFolder: false,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock1.txt',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
            {
                entry: {
                    id: 'node2',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: true,
                    isFolder: false,
                    nodeType: 'mock:type2',
                    aspectNames: ['mock:aspect4', 'mock:aspect2', 'mock:aspect3'],
                    name: 'example.txt',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 3,
                    },
                },
            },
        ],
    },
};

export const contextWithFilesFolders: RuleContext = {
    repository: undefined,
    auth: undefined,
    navigation: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    selection: {
        count: 2,
        isEmpty: false,
        libraries: undefined,
        nodes: [
            {
                entry: {
                    id: 'node1',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: true,
                    isFolder: false,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock1.txt',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
            {
                entry: {
                    id: 'node2',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: false,
                    isFolder: true,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock2',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
        ],
    },
};

export const contextWithFolders: RuleContext = {
    repository: undefined,
    auth: undefined,
    navigation: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    selection: {
        count: 2,
        isEmpty: false,
        libraries: undefined,
        nodes: [
            {
                entry: {
                    id: 'node1',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: false,
                    isFolder: true,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock1',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
            {
                entry: {
                    id: 'node2',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: false,
                    isFolder: true,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock2',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
        ],
    },
};

export const contextWithFolders2: RuleContext = {
    repository: undefined,
    auth: undefined,
    navigation: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    selection: {
        count: 2,
        isEmpty: false,
        libraries: undefined,
        nodes: [
            {
                entry: {
                    id: 'node1',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: false,
                    isFolder: true,
                    nodeType: 'mock:type',
                    aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
                    name: 'mock1',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 2,
                    },
                },
            },
            {
                entry: {
                    id: 'node2',
                    modifiedAt: undefined,
                    modifiedByUser: undefined,
                    createdAt: undefined,
                    createdByUser: undefined,
                    isFile: false,
                    isFolder: true,
                    nodeType: 'mock:type2',
                    aspectNames: ['mock:aspect4', 'mock:aspect2', 'mock:aspect3'],
                    name: 'example',
                    properties: {
                        'mock:prop1': '1',
                        'mock:prop2': true,
                        'mock:prop3': 3,
                    },
                },
            },
        ],
    },
};

export const contextWithCurrentFolder: RuleContext = {
    repository: undefined,
    auth: undefined,
    selection: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    navigation: {
        currentFolder: {
            id: 'node',
            modifiedAt: undefined,
            modifiedByUser: undefined,
            createdAt: undefined,
            createdByUser: undefined,
            isFile: false,
            isFolder: true,
            nodeType: 'mock:type',
            aspectNames: ['mock:aspect1', 'mock:aspect2', 'mock:aspect3'],
            name: 'mock1',
            properties: {
                'mock:prop1': '1',
                'mock:prop2': true,
                'mock:prop3': 2,
            },
        },
    },
};

export const contextWithCurrentFolder2: RuleContext = {
    repository: undefined,
    auth: undefined,
    selection: undefined,
    permissions: undefined,
    profile: undefined,
    getEvaluator: () => undefined,
    navigation: {
        currentFolder: {
            id: 'node',
            modifiedAt: undefined,
            modifiedByUser: undefined,
            createdAt: undefined,
            createdByUser: undefined,
            isFile: false,
            isFolder: true,
            nodeType: 'mock:type2',
            aspectNames: ['mock:aspect4', 'mock:aspect2', 'mock:aspect3'],
            name: 'example',
            properties: {
                'mock:prop1': '1',
                'mock:prop2': true,
                'mock:prop3': 3,
            },
        },
    },
};
