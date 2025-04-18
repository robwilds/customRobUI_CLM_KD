/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum AppSwitcherList {
    StudioAdmin = 'Studio Admin',
    StudioModeling = 'Studio Modeling',
}

import { Page } from '@playwright/test';
import { BaseComponent, Languages, MenuComponent } from '@alfresco-dbp/shared-playwright';

export class HxpHeader extends BaseComponent {
    private static rootElement = 'hxp-header';

    matMenu = new MenuComponent(this.page);

    constructor(page: Page) {
        super(page, HxpHeader.rootElement);
    }

    getAppSwitcherLocator = this.getElementByAutomationId('hxp-header-app-switcher-icon');
    getTitleLocator = this.getChild('.hxp-header-app-title');
    getMenuAppsLocator = this.matMenu.getMenuItemsLocator(`[role='menuitem']`);
    getUserMenuButtonLocator = this.getElementByAutomationId(`hxp-header-menu-button`);
    getUserMenuLanguageOptionLocator = this.matMenu.getElementByAutomationId(`hxp-user-language-menu`);

    async switchToApp(appName: AppSwitcherList): Promise<void> {
        await this.getAppSwitcherLocator.click();
        await this.matMenu.getMenuItemByText(appName).click();
        await this.spinnerWaitForReload('.loader-spinner');
    }

    async switchLanguageTo(language: Languages): Promise<void> {
        await this.getUserMenuButtonLocator.click();
        await this.getUserMenuLanguageOptionLocator.hover();
        await this.matMenu.getLanguageMenuItem(`${language}`).click();
    }
}
