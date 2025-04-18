/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { RouterModule } from '@angular/router';
import { AuthGuard, CoreModule, provideTranslations } from '@alfresco/adf-core';
import {
    ContentBrowserComponent,
    HxpSidenavComponent,
    WorkspaceHxpContentServicesExtensionContentBrowserFeatureShellModule,
} from '@hxp/workspace-hxp/content-services-extension/content-browser/feature-shell';
import { isContentServiceEnabled } from './rules/content-services-extension-rules';
import { SingleItemMoveModule } from './extensions/single-item-move/single-item-move.module';
import { SingleItemCopyModule } from './extensions/single-item-copy/single-item-copy.module';
import { PermissionManagementModule } from './extensions/permission-management/permission-management.module';
import { ManageVersionsModule } from './extensions/manage-versions/manage-versions.module';

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        RouterModule,
        WorkspaceHxpContentServicesExtensionContentBrowserFeatureShellModule,
        SingleItemMoveModule,
        SingleItemCopyModule,
        PermissionManagementModule,
        ManageVersionsModule,
    ],
    providers: [
        provideExtensionConfig(['content-services.extension.json']),
        provideTranslations('content-services-extension-domain-shell', 'assets/content-services-extension-domain-shell'),
    ],
})
export class HxwContentServicesModule {
    constructor(extensions: ExtensionService) {
        extensions.setAuthGuards({
            'content-services-app.auth': AuthGuard,
        });

        extensions.setComponents({
            'content-services-app.sidenav': HxpSidenavComponent,
            'content-services-app.main-content': ContentBrowserComponent,
        });

        extensions.setEvaluators({
            isContentServiceEnabled: isContentServiceEnabled,
        });
    }
}
