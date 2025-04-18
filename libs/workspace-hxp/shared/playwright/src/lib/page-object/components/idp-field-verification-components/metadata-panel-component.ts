/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/shared-playwright';

export class HxpIdpMetadataPanelComponent extends BaseComponent {
    static readonly rootElement: string = '.idp-metadata-panel';

    readonly undoButton: Locator;
    readonly redoButton: Locator;
    readonly rejectButton: Locator;

    constructor(page: Page) {
        super(page, HxpIdpMetadataPanelComponent.rootElement);
        this.undoButton = this.getElementByAutomationId('idp-field-undo-button');
        this.redoButton = this.getElementByAutomationId('idp-field-redo-button');
        this.rejectButton = this.getElementByAutomationId('idp-field-reject-button');
    }

    /**
     * Get the element indicating if a field has an issue.
     * @param fieldId - The ID of the field.
     * @returns The element representing the field issue status.
     */
    getFieldHasIssue(fieldId: string): Locator {
        return this.getElementByAutomationId(`field-has-issue${fieldId}`);
    }

    /**
     * Get the input element of a field.
     * @param fieldId - The ID of the field.
     * @returns The input element of the field.
     */
    getFieldInput(fieldId: string): Locator {
        return this.getElementByAutomationId(`idp-field-${fieldId}`);
    }

    /**
     * Get the extraction result element of a field.
     * @param fieldId - The ID of the field.
     * @returns The extraction result element of the field.
     */
    getFieldExtractionResult(fieldId: string): Locator {
        return this.getElementByAutomationId(`idp-field-extraction-result-${fieldId}`);
    }
}
