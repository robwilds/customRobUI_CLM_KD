/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { AdfInfoDrawer, TaskHeaderComponent, UserTaskFormComponent } from '../components';
import { HomePage } from './';

export class TaskDetailsPage extends HomePage {
    private static pageUrl = 'task-details-cloud';

    constructor(page: Page) {
        super(page, TaskDetailsPage.pageUrl);
    }

    taskForm = new UserTaskFormComponent(this.page);
    taskHeader = new TaskHeaderComponent(this.page);
    infoDrawer = new AdfInfoDrawer(this.page);
}
