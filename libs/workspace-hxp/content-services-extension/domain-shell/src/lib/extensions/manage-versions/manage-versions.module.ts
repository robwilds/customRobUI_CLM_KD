/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ManageVersionsButtonComponent } from './manage-versions-button/manage-versions-button.component';
import { ExtensionService } from '@alfresco/adf-extensions';

@NgModule({
    imports: [ManageVersionsButtonComponent],
})
export class ManageVersionsModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'document.manage_versions': ManageVersionsButtonComponent,
        });
    }
}
