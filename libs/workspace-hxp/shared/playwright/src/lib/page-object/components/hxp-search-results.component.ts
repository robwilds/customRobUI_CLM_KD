/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/shared-playwright';
import { HxpSearchResultsHeaderComponent } from './hxp-search-results-header.component';

export class HxpSearchResultsComponent extends BaseComponent {
    static rootElement = 'hxp-search-results';

    constructor(page: Page) {
        super(page, HxpSearchResultsComponent.rootElement);
    }

    header = new HxpSearchResultsHeaderComponent(this.page);

    oldResultListItemsLocator = this.getChild(materialLocators.List.item.class);
    noResultsLocator = this.getChild('.hxp-search-no-results');

    textSearchTabLocator = this.getChild('[role="tab"]').nth(0);
    HXQLSearchTabLocator = this.getChild('[role="tab"]').nth(1);

    getResultsNumberMessage = (message: string) => this.header.resultsNumberMessageLocator.filter({ hasText: message });

    async getResultsNumberFromHeader(): Promise<number> {
        const resultsMessage = await this.header.resultsNumberMessageLocator.textContent();
        const match = resultsMessage?.match(/(\d+) Results Found/);
        if (match && match[1]) {
            return Number.parseInt(match[1], 10);
        }
        throw new Error(`Results number not found in the message: "${resultsMessage}"`);
    }

    getResultTitleLocator = (message: string) => this.getChild(`${materialLocators.List.item.class} .hxp-title`, { hasText: message });
    getResultDescLocator = (message: string) => this.getChild(`${materialLocators.List.item.class} .hxp-desc`, { hasText: message });
}
