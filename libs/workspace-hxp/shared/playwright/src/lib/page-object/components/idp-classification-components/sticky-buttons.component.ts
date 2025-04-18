/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class HxpIdpStickyButtonsComponent extends BaseComponent {
    static rootElement = '.idp-viewer-sticky-button';

    constructor(page: Page) {
        super(page, HxpIdpStickyButtonsComponent.rootElement);
    }

    shortcutButton = this.getElementByAutomationId('idp-shortcut-sticky-button');
}
