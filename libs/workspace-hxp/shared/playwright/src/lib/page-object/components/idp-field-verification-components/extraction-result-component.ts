/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class HxpIdpExtractionResultContainer extends BaseComponent {
    static rootElement = 'idp-extraction-result';

    constructor(page: Page) {
        super(page, HxpIdpExtractionResultContainer.rootElement);
    }

    getExtractionResultIcon(status: string) {
        return this.getElementByAutomationId(`idp-field-extraction-result-icon-${status}`);
    }

    getExtractionResultText(status: string) {
        return this.getElementByAutomationId(`idp-field-extraction-result-text-${status}`);
    }
}
