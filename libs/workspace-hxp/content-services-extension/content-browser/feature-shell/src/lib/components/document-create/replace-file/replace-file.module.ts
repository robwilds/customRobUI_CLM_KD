/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { ReplaceFileButtonComponent } from './replace-file-button/replace-file-button-component';
import { AdfEnterpriseAdfHxContentServicesServicesModule } from '@alfresco/adf-hx-content-services/services';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';

@NgModule({
    imports: [AdfEnterpriseAdfHxContentServicesServicesModule, HxpUploadModule, ReplaceFileButtonComponent],
})
export class ReplaceFileModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'document.replace_file': ReplaceFileButtonComponent,
        });
    }
}
