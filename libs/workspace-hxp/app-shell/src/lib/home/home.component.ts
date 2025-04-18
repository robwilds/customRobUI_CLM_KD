/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '@alfresco/adf-core';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { isContentServiceEnabled } from '@hxp/workspace-hxp/content-services-extension/domain-shell';
import { DocumentRouterService } from '@alfresco/adf-hx-content-services/services';

@Component({
    standalone: false,
    template: '',
})
export class HomeComponent implements OnInit {
    readonly DEFAULT_LANDING_PAGE = '';

    constructor(private appConfig: AppConfigService, private router: Router, private documentRouterService: DocumentRouterService) {}

    ngOnInit() {
        const landingPageUrl = this.appConfig.get('landingPage', this.DEFAULT_LANDING_PAGE);
        if (!landingPageUrl && isContentServiceEnabled()) {
            this.documentRouterService.navigateTo(ROOT_DOCUMENT);
        } else {
            void this.router.navigateByUrl(landingPageUrl);
        }
    }
}
