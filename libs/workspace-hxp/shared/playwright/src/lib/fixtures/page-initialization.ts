/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    test as base,
    getDeployedApp,
    HxpLoginPage,
    HxprApi,
    QueryService,
    RuntimeBundleService,
    PreferenceMock,
} from '@alfresco-dbp/shared-playwright';
import {
    ContentBrowserPage,
    TasksPage,
    ProcessPage,
    StartProcessPage,
    TaskDetailsPage,
    SearchPage,
    ClassificationPage,
    FieldVerificationPage,
    CustomUiPage,
    ProcessDetailsPage,
} from '../page-object/pages';
import { DocumentMock } from '../mocks';

interface Pages {
    contentBrowserPage: ContentBrowserPage;
    tasksPage: TasksPage;
    processPage: ProcessPage;
    customUiPage: CustomUiPage;
    startProcessPage: StartProcessPage;
    taskDetailsPage: TaskDetailsPage;
    hxpIdpLoginPage: HxpLoginPage;
    searchPage: SearchPage;
    idpClassificationPage: ClassificationPage;
    fieldVerificationPage: FieldVerificationPage;
    processDetailsPage: ProcessDetailsPage;
}

interface Api {
    hxprApi: HxprApi;
    documentMock: DocumentMock;
    runtimeBundleServiceHrUser: RuntimeBundleService;
    queryServiceHrUser: QueryService;
    preferenceMock: PreferenceMock;
}

export const test = base.extend<Pages & Api>({
    contentBrowserPage: async ({ page }, use) => {
        await use(new ContentBrowserPage(page));
    },
    fieldVerificationPage: async ({ page }, use) => {
        await use(new FieldVerificationPage(page));
    },
    idpClassificationPage: async ({ page }, use) => {
        await use(new ClassificationPage(page));
    },
    tasksPage: async ({ page }, use) => {
        await use(new TasksPage(page));
    },
    processPage: async ({ page }, use) => {
        await use(new ProcessPage(page));
    },
    startProcessPage: async ({ page }, use) => {
        await use(new StartProcessPage(page));
    },
    taskDetailsPage: async ({ page }, use) => {
        await use(new TaskDetailsPage(page));
    },
    hxpIdpLoginPage: async ({ page }, use) => {
        await use(new HxpLoginPage(page));
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPage(page));
    },
    customUiPage: async ({ page }, use) => {
        await use(new CustomUiPage(page));
    },
    processDetailsPage: async ({ page }, use) => {
        await use(new ProcessDetailsPage(page));
    },
    // eslint-disable-next-line no-empty-pattern
    hxprApi: async ({}, use) => {
        await use(await new HxprApi().initialize());
    },
    documentMock: async ({ page }, use) => {
        await use(new DocumentMock(page));
    },
    preferenceMock: async ({ page }, use) => {
        await use(new PreferenceMock(page));
    },
    runtimeBundleServiceHrUser: async ({ hrUserApiContext }, use, workerInfo) => {
        const { appName } = getDeployedApp(workerInfo);
        await use(new RuntimeBundleService(hrUserApiContext, appName));
    },
    queryServiceHrUser: async ({ hrUserApiContext }, use, workerInfo) => {
        const { appName } = getDeployedApp(workerInfo);
        await use(new QueryService({ context: hrUserApiContext, appName: appName }));
    },
});

export { expect } from '@playwright/test';
