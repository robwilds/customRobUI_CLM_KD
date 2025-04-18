/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, InjectionToken, Optional } from '@angular/core';

const defaultDocumentationUrl = 'https://support.hyland.com/p/hylandexperience';
const HXP_HEADER_MENU_DOCUMENTATION_URL = new InjectionToken<string>(defaultDocumentationUrl, {
    factory: () => defaultDocumentationUrl,
});

@Component({
    standalone: false,
    selector: 'hxp-help',
    template: `
        <a mat-menu-item data-automation-id="help" target="_blank" [href]="docsUrl">
            <mat-icon aria-hidden="true">help_outlined</mat-icon>
            {{ 'APP.HEADER.HELP' | translate }}
        </a>
    `,
})
export class HelpComponent {
    constructor(@Optional() @Inject(HXP_HEADER_MENU_DOCUMENTATION_URL) public docsUrl = defaultDocumentationUrl) {}
}
