/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { DocumentMoveButtonComponent } from './document-move-button/document-move-button-component';
import { DocumentMoveDialogComponent } from './document-move-dialog/document-move-dialog.component';
import { AdfEnterpriseAdfHxContentServicesServicesModule, HXP_DOCUMENT_MOVE_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { DocumentMoveButtonActionService } from './document-move-button/document-move-button-action.service';
import { ExtensionService } from '@alfresco/adf-extensions';

@NgModule({
    imports: [AdfEnterpriseAdfHxContentServicesServicesModule, DocumentMoveButtonComponent, DocumentMoveDialogComponent],
    providers: [
        {
            provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE,
            useClass: DocumentMoveButtonActionService,
        },
    ],
})
export class SingleItemMoveModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'document.move': DocumentMoveButtonComponent,
        });
    }
}
