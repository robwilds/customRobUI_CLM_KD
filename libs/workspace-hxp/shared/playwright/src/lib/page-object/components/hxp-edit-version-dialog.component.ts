/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class HxpEditVersionDialogComponent extends BaseComponent {
    static rootElement = '.hxp-edit-version-dialog';

    constructor(page: Page) {
        super(page, HxpEditVersionDialogComponent.rootElement);
    }

    versionTitleInputField = this.getChild('.hxp-input-area [data-automation-id="title-field"]');
    versionDescriptionInputField = this.getChild('.hxp-input-area [data-automation-id="description-field"]');
    saveButton = this.getChild('.hxp-manage-version-dialog-save-btn-title');
}
