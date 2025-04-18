/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { Document } from '@hylandsoftware/hxcs-js-client/typings';
import { TestInfo } from '@playwright/test';

import { ProcessInstanceData, RequestResponse, RuntimeBundleService, timeouts, HxprApi, FileProperties } from '@alfresco-dbp/shared-playwright';

import { test, expect } from '../fixtures';
import { TasksPage } from '../page-object/pages';

interface TestProcess {
    processDefinitionKey: string;
    variables: { [key: string]: any };
}

export async function createFolder(hxprApi: HxprApi, files: FileProperties[]) {
    let uploadFolder: Readonly<Document>;
    const uploadedFiles: Readonly<Document>[] = [];

    await test.step('Create temporary folder and upload files', async () => {
        uploadFolder = await hxprApi.documentServiceApi.createFolder('pw-run', 'temporary files uploaded during an e2e test');
        expect(uploadFolder).toBeDefined();
        expect(uploadFolder).not.toHaveProperty('status');

        for (const file of files) {
            const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(file, uploadFolder.sys_id);
            expect(uploadedFile).toBeDefined();
            expect(uploadedFile).not.toHaveProperty('status');
            uploadedFiles.push(uploadedFile);
        }
    });

    return { uploadFolder, uploadedFiles };
}

export async function startProcess(
    runtimeBundleService: RuntimeBundleService,
    testFile: any,
    testProcess: TestProcess
): Promise<ProcessInstanceData | RequestResponse> {
    const processInstance = await runtimeBundleService.processInstance.startProcess(testProcess.processDefinitionKey, {
        variables: { [testProcess.variables.attachedFiles.name as string]: testFile },
    });
    expect(processInstance).not.toHaveProperty('status'); // Confirm we have a process instance instead of an HTTP response
    return processInstance;
}

export async function waitForUserTask(
    runtimeBundleService: RuntimeBundleService,
    processInstance: ProcessInstanceData | RequestResponse
): Promise<any> {
    test.slow(true, 'Classification can take some time.');
    return runtimeBundleService.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.entry.id, { delay: timeouts.large });
}

export async function refreshUserState(tasksPage: TasksPage, workerInfo: TestInfo) {
    await tasksPage.refreshUserState('hruser', workerInfo.project.use);
    await tasksPage.navigate({ waitUntil: 'load' });
}

export async function cleanupFiles(hxprApi: HxprApi, uploadFolder: Readonly<Document>) {
    await test.step('Delete temporary folder/files', async () => {
        await hxprApi.documentServiceApi.deleteDocumentById(uploadFolder.sys_id);
    });
}
