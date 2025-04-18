/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { GovernanceServicesExtensionComponent } from './governance-services-extension/governance-services-extension.component';
import { GovernanceSidenavMenuItemComponent } from './sidenav-menu-item/sidenav-menu-item.component';
import { provideTranslations } from '@alfresco/adf-core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@NgModule({
    imports: [],
    declarations: [],
    exports: [],
    providers: [
        provideExtensionConfig(['governance-services.extension.json']),
        provideTranslations('governance-services-extension-domain-shell', 'assets/governance-services-extension-domain-shell'),
    ],
})
export class WorkspaceHxpGovernanceServicesExtensionModule {
    constructor(extensions: ExtensionService, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry) {
        extensions.setComponents({
            'governance-services-app.search-results': GovernanceServicesExtensionComponent,
            'governances-services.sidenav-item': GovernanceSidenavMenuItemComponent,
        });

        this.matIconRegistry.addSvgIcon('governance_search', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/Governance_search.svg'));
    }
}
