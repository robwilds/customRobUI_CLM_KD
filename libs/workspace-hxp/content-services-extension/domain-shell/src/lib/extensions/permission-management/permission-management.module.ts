/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { PermissionsManagementButtonComponent } from './permissions-management-button/permissions-management-button-component';
import { AdfEnterpriseAdfHxContentServicesServicesModule, HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { PermissionsButtonActionService } from '@alfresco/adf-hx-content-services/ui';

@NgModule({
    imports: [PermissionsManagementButtonComponent, AdfEnterpriseAdfHxContentServicesServicesModule],
    providers: [
        {
            provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
            useClass: PermissionsButtonActionService,
        },
    ],
})
export class PermissionManagementModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'document.permissions_management': PermissionsManagementButtonComponent,
        });
    }
}
