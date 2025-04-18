/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class HxpIdpShortcutDialogComponent extends BaseComponent {
    static rootElement = '.idp-shortcut-browser-dialog';

    constructor(page: Page) {
        super(page, HxpIdpShortcutDialogComponent.rootElement);
    }

    navigateUpShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-navigate-up');
    selectAllPagesShortcutDescription = this.getElementByAutomationId('idp-shortcut-list-item-select-all-pages-or-documents');
    shortcutDialogTitle = this.getElementByAutomationId('idp-shortcut-dialog-title');
    shortcutDialogInput = this.getElementByAutomationId('idp-shortcut-search-input');
}
