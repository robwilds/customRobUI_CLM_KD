/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { DocumentCopyDialogComponent } from './document-copy-dialog/document-copy-dialog.component';
import { DocumentCopyButtonComponent } from './document-copy-button/document-copy-button-component';
import { HXP_DOCUMENT_COPY_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { CopyButtonActionService } from './document-copy-button/document-copy-button-action.service';
import { ExtensionService } from '@alfresco/adf-extensions';

@NgModule({
    imports: [DocumentCopyDialogComponent, DocumentCopyButtonComponent],
    providers: [
        {
            provide: HXP_DOCUMENT_COPY_ACTION_SERVICE,
            useClass: CopyButtonActionService,
        },
    ],
})
export class SingleItemCopyModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'document.copy': DocumentCopyButtonComponent,
        });
    }
}
