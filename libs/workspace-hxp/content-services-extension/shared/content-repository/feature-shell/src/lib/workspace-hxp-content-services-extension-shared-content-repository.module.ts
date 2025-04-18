/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';
import { WorkspaceHxpContentServicesExtensionSharedUploadModule } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { HxpDocumentListComponent, TableSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { ContentRepositoryComponent } from './components/content-repository/content-repository.component';

@NgModule({
    imports: [
        CommonModule,
        WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule,
        HxpUploadModule,
        HxpDocumentListComponent,
        HxpUploadModule,
        TableSkeletonLoaderComponent,
        WorkspaceHxpContentServicesExtensionSharedUploadModule,
    ],
    declarations: [ContentRepositoryComponent],
    exports: [ContentRepositoryComponent],
})
export class WorkspaceHxpContentServicesExtensionSharedContentRepositoryModule {}
