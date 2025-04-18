/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentActionToolbarComponent } from './document-action-toolbar/document-action-toolbar.component';
import { CoreModule } from '@alfresco/adf-core';
import { SelectedItemCountComponent } from './selected-item-count/selected-item-count.component';
import { AdfEnterpriseAdfHxContentServicesServicesModule } from '@alfresco/adf-hx-content-services/services';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ContentDeleteButtonComponent,
    ContentPropertiesViewerButtonComponent,
    ContentShareButtonComponent,
    DocumentMoreActionComponent,
    ManageColumnButtonComponent,
    SingleItemDownloadButtonComponent,
} from '@alfresco/adf-hx-content-services/ui';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        AdfEnterpriseAdfHxContentServicesServicesModule,
        MatTooltipModule,
        ContentPropertiesViewerButtonComponent,
        ContentDeleteButtonComponent,
        SingleItemDownloadButtonComponent,
        ContentShareButtonComponent,
        DocumentMoreActionComponent,
        ManageColumnButtonComponent,
    ],
    declarations: [DocumentActionToolbarComponent, SelectedItemCountComponent],
    exports: [DocumentActionToolbarComponent],
})
export class WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule {}
