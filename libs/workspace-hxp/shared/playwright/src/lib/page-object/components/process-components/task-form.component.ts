/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent, materialLocators } from '@alfresco-dbp/shared-playwright';
import { DropdownComponent } from './dropdown.component';

export abstract class TaskFormComponent extends BaseComponent {
    dropdown = new DropdownComponent(this.page);

    getActionButtonLocator = (buttonName: string) => this.getChild(`${materialLocators.Card.actions} button`, { hasText: buttonName });
    getFieldByIdLocator = (id: string) => this.getChild(`#field-${id}-container`);
    getFieldInputByIdLocator = (id: string) => this.getFieldByIdLocator(id).locator('input');
    getHeaderByIdLocator = (id: string) => this.getFieldByIdLocator(id).locator('.adf-container-widget-header');
    getSectionFieldByIdLocator = (sectionId: string, fieldId: string) => this.getFieldByIdLocator(sectionId).locator(`#field-${fieldId}-container`);
    getSectionFieldInputByIdLocator = (sectionId: string, fieldId: string) => this.getSectionFieldByIdLocator(sectionId, fieldId).locator('input');
    getHeaderLabelByIdLocator = (id: string) => this.getHeaderByIdLocator(id).locator(`#container-header-label-${id}`);
    getFieldColumnByIdLocator = (id: string) => this.getFieldByIdLocator(id).locator('> div');
    getFieldNthColumnByIdLocator = (id: string, nth: number) => this.getFieldColumnByIdLocator(id).nth(nth);
    getSectionFieldInNthColumnByIdLocator = (sectionId: string, fieldId: string, nth: number) =>
        this.getFieldNthColumnByIdLocator(sectionId, nth).locator(`#field-${fieldId}-container`);
    getErrorMessageLocator = (id?: string) => (id ? this.getChild(`adf-error-text-${id}`) : this.getChild(`.adf-error-text`));
}
