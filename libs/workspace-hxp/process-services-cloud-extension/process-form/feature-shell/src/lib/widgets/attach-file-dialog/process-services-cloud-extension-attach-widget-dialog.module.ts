/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@alfresco/adf-core';
import { ContentTypeIconComponent, HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { AttachFileDialogComponent } from './attach-file-dialog.component';
import { AdfEnterpriseAdfHxContentServicesServicesModule, UserResolverPipe } from '@alfresco/adf-hx-content-services/services';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        CoreModule,
        MatTabsModule,
        HxpUploadModule,
        AdfEnterpriseAdfHxContentServicesServicesModule,
        HxpDocumentListComponent,
        ContentTypeIconComponent,
        UserResolverPipe,
    ],
    declarations: [AttachFileDialogComponent],
    exports: [AttachFileDialogComponent],
})
export class ProcessServicesCloudExtensionProcessFormAttachWidgetDialogModule {}
