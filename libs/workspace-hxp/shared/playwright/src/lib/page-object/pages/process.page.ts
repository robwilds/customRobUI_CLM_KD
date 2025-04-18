/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { ProcessManagementPage } from './';

export class ProcessPage extends ProcessManagementPage {
    private static pageUrl = '/process-list-cloud';

    constructor(page: Page) {
        super(page, ProcessPage.pageUrl);
    }
}
