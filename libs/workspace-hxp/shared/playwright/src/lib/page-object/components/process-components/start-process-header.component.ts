/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class StartProcessHeaderComponent extends BaseComponent {
    private static rootElement = 'adf-inplace-form-input';

    constructor(page: Page) {
        super(page, StartProcessHeaderComponent.rootElement);
    }

    processNameInput = this.getElementByAutomationId('adf-inplace-input');
}
