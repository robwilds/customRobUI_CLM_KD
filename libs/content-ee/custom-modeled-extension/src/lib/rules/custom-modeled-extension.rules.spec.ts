/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './custom-modeled-extension.rules';
import {
    contextWithFiles,
    contextWithFilesFolders,
    contextWithFolders,
    contextWithCurrentFolder,
    contextWithFiles2,
    contextWithFolders2,
    contextWithCurrentFolder2,
} from './context-rules.mock';
import { RuleParameter } from '@alfresco/adf-extensions';

describe('Rules for node type', () => {
    const args: RuleParameter = {
        type: 'value',
        value: 'mock:type',
    };

    describe('filesAreOfType rule', () => {
        it('Should return true when all files belong to type', () => {
            expect(rules.filesAreOfType(contextWithFiles, args)).toBeTrue();
        });

        it('Should return false when a file does not belong to the type', () => {
            expect(rules.filesAreOfType(contextWithFiles2, args)).toBeFalse();
        });

        it('Should return false when folders are selected', () => {
            expect(rules.filesAreOfType(contextWithFilesFolders, args)).toBeFalse();
        });
    });

    describe('foldersAreOfType rule', () => {
        it('Should return true when all folders belong to type', () => {
            expect(rules.foldersAreOfType(contextWithFolders, args)).toBeTrue();
        });

        it('Should return false when a folder does not belong to the type', () => {
            expect(rules.foldersAreOfType(contextWithFolders2, args)).toBeFalse();
        });

        it('Should return false when files are selected', () => {
            expect(rules.foldersAreOfType(contextWithFilesFolders, args)).toBeFalse();
        });
    });

    describe('currentFolderIsOfType rule', () => {
        it('Should return true when current folder belongs to type', () => {
            expect(rules.currentFolderIsOfType(contextWithCurrentFolder, args)).toBeTrue();
        });

        it('Should return false when current folder does not belong to the type', () => {
            expect(rules.currentFolderIsOfType(contextWithCurrentFolder2, args)).toBeFalse();
        });
    });
});

describe('Rules for node aspect', () => {
    const args: RuleParameter = {
        type: 'value',
        value: 'mock:aspect1',
    };

    describe('filesHaveAspect rule', () => {
        it('Should return true when all files have the aspect', () => {
            expect(rules.filesHaveAspect(contextWithFiles, args)).toBeTrue();
        });

        it('Should return false when a file does not have the aspect', () => {
            expect(rules.filesHaveAspect(contextWithFiles2, args)).toBeFalse();
        });

        it('Should return false when folders are selected', () => {
            expect(rules.filesHaveAspect(contextWithFilesFolders, args)).toBeFalse();
        });
    });

    describe('foldersHaveAspect rule', () => {
        it('Should return true when all folders have the aspect', () => {
            expect(rules.foldersHaveAspect(contextWithFolders, args)).toBeTrue();
        });

        it('Should return false when a folder does not have the aspect', () => {
            expect(rules.foldersHaveAspect(contextWithFolders2, args)).toBeFalse();
        });

        it('Should return false when files are selected', () => {
            expect(rules.foldersHaveAspect(contextWithFilesFolders, args)).toBeFalse();
        });
    });

    describe('currentFolderHasAspect rule', () => {
        it('Should return true when current folder has the aspect', () => {
            expect(rules.currentFolderHasAspect(contextWithCurrentFolder, args)).toBeTrue();
        });

        it('Should return false when current folder does not have the aspect', () => {
            expect(rules.currentFolderHasAspect(contextWithCurrentFolder2, args)).toBeFalse();
        });
    });
});

describe('Rules for node name', () => {
    const arg1: RuleParameter = {
        type: 'value',
        value: 'mock',
    };
    const arg2: RuleParameter = {
        type: 'operator',
        value: 'contains',
    };

    const arg3: RuleParameter = {
        type: 'value',
        value: /^mock/,
    };
    const arg4: RuleParameter = {
        type: 'operator',
        value: 'matches',
    };
    const arg5: RuleParameter = {
        type: 'value',
        value: '^mock',
    };
    const arg6: RuleParameter = {
        type: 'value',
        value: '/^mock/',
    };

    describe('fileNamesContainString rule', () => {
        it('Should return true when all files contain the name', () => {
            expect(rules.fileNames(contextWithFiles, arg1, arg2)).toBeTrue();
        });

        it('Should return false when a file does contain the name', () => {
            expect(rules.fileNames(contextWithFiles2, arg1, arg2)).toBeFalse();
        });

        it('Should return false when folders are selected', () => {
            expect(rules.fileNames(contextWithFilesFolders, arg1, arg2)).toBeFalse();
        });

        it('Should return true when all files match the regexp for name', () => {
            expect(rules.fileNames(contextWithFiles, arg3, arg4)).toBeTrue();
        });
    });

    describe('folderNamesContainString rule', () => {
        it('Should return true when all folders contain the name', () => {
            expect(rules.folderNames(contextWithFolders, arg1, arg2)).toBeTrue();
        });

        it('Should return false when a folder does not contain the name', () => {
            expect(rules.folderNames(contextWithFolders2, arg1, arg2)).toBeFalse();
        });

        it('Should return false when files are selected', () => {
            expect(rules.folderNames(contextWithFilesFolders, arg1, arg2)).toBeFalse();
        });

        it('Should return true when all folders match the regexp for name', () => {
            expect(rules.folderNames(contextWithFolders, arg5, arg4)).toBeTrue();
        });
    });

    describe('currentFolderNameContainsString rule', () => {
        it('Should return true when current folder contains the name', () => {
            expect(rules.currentFolderName(contextWithCurrentFolder, arg1, arg2)).toBeTrue();
        });

        it('Should return false when current folder does not contain the name', () => {
            expect(rules.currentFolderName(contextWithCurrentFolder2, arg1, arg2)).toBeFalse();
        });

        it('Should return true when current folder matches the regexp for name', () => {
            expect(rules.currentFolderName(contextWithCurrentFolder, arg6, arg4)).toBeTrue();
        });
    });
});

describe('Rules for node property', () => {
    const arg1: RuleParameter = {
        type: 'argument',
        value: 'mock:prop3',
    };
    const arg2: RuleParameter = {
        type: 'value',
        value: 2,
    };

    describe('filesHavePropertyWithValue rule', () => {
        it('Should return true when all files have the property with the desired value', () => {
            expect(rules.filesHavePropertyWithValue(contextWithFiles, arg1, arg2)).toBeTrue();
        });

        it('Should return false when a file does not have the property with the desired value', () => {
            expect(rules.filesHavePropertyWithValue(contextWithFiles2, arg1, arg2)).toBeFalse();
        });

        it('Should return false when folders are selected', () => {
            expect(rules.filesHavePropertyWithValue(contextWithFilesFolders, arg1, arg2)).toBeFalse();
        });
    });

    describe('folderHavePropertyWithValue rule', () => {
        it('Should return true when all folders have the property with the desired value', () => {
            expect(rules.folderHavePropertyWithValue(contextWithFolders, arg1, arg2)).toBeTrue();
        });

        it('Should return false when a folder does not have the property with the desired value', () => {
            expect(rules.folderHavePropertyWithValue(contextWithFolders2, arg1, arg2)).toBeFalse();
        });

        it('Should return false when files are selected', () => {
            expect(rules.folderHavePropertyWithValue(contextWithFilesFolders, arg1, arg2)).toBeFalse();
        });
    });

    describe('currentFolderHasPropertyWithValue rule', () => {
        it('Should return true when current folder has the property with the desired value', () => {
            expect(rules.currentFolderHasPropertyWithValue(contextWithCurrentFolder, arg1, arg2)).toBeTrue();
        });

        it('Should return false when current folder does not have the property with the desired value', () => {
            expect(rules.currentFolderHasPropertyWithValue(contextWithCurrentFolder2, arg1, arg2)).toBeFalse();
        });
    });
});
