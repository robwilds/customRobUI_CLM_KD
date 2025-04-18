/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { RadioButtonComponent, DropdownComponent } from '../generic-components';
import { TaskFormComponent } from './task-form.component';
import { OverlayPaneComponent } from '@alfresco-dbp/shared-playwright';

export class UserTaskFormComponent extends TaskFormComponent {
    private static rootElement = 'adf-cloud-task-form';

    dropdownComponent = new DropdownComponent(this.page);
    radioButtonComponent = new RadioButtonComponent(this.page);
    overlayPaneComponent = new OverlayPaneComponent(this.page);

    constructor(page: Page) {
        super(page, UserTaskFormComponent.rootElement);
    }

    completeButtonLocator = this.getChild('#adf-form-complete');
}
