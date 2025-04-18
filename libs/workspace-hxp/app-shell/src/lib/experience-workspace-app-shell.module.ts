/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './sidenav/sidenav.component';
import { CoreModule, STORAGE_PREFIX_FACTORY_SERVICE } from '@alfresco/adf-core';
import { ShellModule, SHELL_APP_SERVICE } from '@alfresco/adf-core/shell';
import { APP_ROUTES } from './experience-workspace-app-shell.routes';
import { HxpAppShellService } from './app-shell.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { MainActionButtonComponent } from './main-action-button/main-action-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { HxwContentServicesModule } from '@hxp/workspace-hxp/content-services-extension/domain-shell';

import { LogoutComponent } from '@hxp/shared-hxp/ui';
import { HelpComponent } from './help/help.component';
import { ProcessServicesCloudExtensionDomainShellModule } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/domain-shell';
import { HomeComponent } from './home/home.component';
import { StoragePrefixFactory } from './prefix-factory/storage-prefix.factory';
import { IDENTITY_USER_SERVICE_TOKEN } from '@alfresco/adf-hx-content-services/services';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';
import { UserInfoComponent } from '@alfresco-dbp/shared/user-info';
import { WorkspaceHxpIdpServicesDomainShellModule } from '@hxp/workspace-hxp/idp-services-extension/domain-shell';
import { WorkspaceHxpGovernanceServicesExtensionModule } from '@hxp/workspace-hxp/governance-services-extension/domain-shell';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        ShellModule,
        ExtensionsModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        RouterModule.forChild(APP_ROUTES),
        HxwContentServicesModule,
        ProcessServicesCloudExtensionDomainShellModule,
        TranslateModule,
        UserInfoComponent,
        LogoutComponent,
        WorkspaceHxpIdpServicesDomainShellModule,
        WorkspaceHxpGovernanceServicesExtensionModule,
    ],
    providers: [
        {
            provide: SHELL_APP_SERVICE,
            useClass: HxpAppShellService,
        },

        {
            provide: STORAGE_PREFIX_FACTORY_SERVICE,
            useClass: StoragePrefixFactory,
        },
        {
            provide: IDENTITY_USER_SERVICE_TOKEN,
            useExisting: IdentityUserService,
        },
    ],

    declarations: [SidenavComponent, MainActionButtonComponent, HelpComponent, HomeComponent],
})
export class ExperienceWorkspaceAppShellModule {}
