/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule, provideTranslations } from '@alfresco/adf-core';
import { ExtensionLoaderCallback, ProcessServicesCloudExtensionModule } from '@alfresco/adf-process-services-cloud-extension';
import {
    DownloadService,
    ProcessServicesCloudExtensionProcessFormDataAccessModule,
    UploadFileDocumentCreatorService,
} from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/process-form/data-access';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { ExtensionService } from '@alfresco/adf-extensions';
import { TaskFiltersCloudModule, ProcessFiltersCloudModule } from '@alfresco/adf-process-services-cloud';
import { RouterModule } from '@angular/router';
import { SidenavProcessListComponent } from './components/sidenav-process-list/sidenav-process-list.component';
import { SidenavProcessManagementComponent } from './components/sidenav-process-management/sidenav-process-management.component';
import { SidenavTaskListComponent } from './components/sidenav-task-list/sidenav-task-list.component';
import { SharedHxpFormServicesModule, SharedHxpServicesModule } from '@hxp/shared-hxp/services';
import { SharedWidgetsHxpFeatureShellModule, ProcessFormRenderingService } from '@hxp/shared-hxp/form-widgets/feature-shell';
import { AttachFileDialogService } from './widgets/attach-file-dialog/services/attach-file-dialog.service';
import { ProcessServicesCloudExtensionProcessFormAttachWidgetDialogModule } from './widgets/attach-file-dialog/process-services-cloud-extension-attach-widget-dialog.module';
import {
    AdfEnterpriseAdfHxContentServicesServicesModule,
    DocumentService,
    DocumentPropertiesService,
} from '@alfresco/adf-hx-content-services/services';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const EXTENSION_DATA_LOADERS_TOKEN = new InjectionToken<ExtensionLoaderCallback[]>('HXP_EXTENSION_DATA_LOADERS_TOKEN');

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        RouterModule,
        MatTabsModule,
        MatSnackBarModule,
        ProcessServicesCloudExtensionModule.withConfig({
            extensionDataLoadersToken: EXTENSION_DATA_LOADERS_TOKEN,
        }),
        SharedWidgetsHxpFeatureShellModule,
        SharedHxpServicesModule.forProcess({
            DocumentPropertiesService,
            DocumentService,
        }),
        SharedHxpFormServicesModule.forForm({
            UploadMiddlewareService: UploadFileDocumentCreatorService,
            DownloadService: DownloadService,
            AttachFileDialogService: AttachFileDialogService,
            FormRenderingService: ProcessFormRenderingService,
        }),
        ProcessServicesCloudExtensionProcessFormDataAccessModule,
        TaskFiltersCloudModule,
        ProcessFiltersCloudModule,
        TranslateModule,
        AdfEnterpriseAdfHxContentServicesServicesModule,
        ProcessServicesCloudExtensionProcessFormAttachWidgetDialogModule,
        HxpUploadModule,
        SidenavProcessListComponent,
        SidenavTaskListComponent,
        SidenavProcessManagementComponent,
    ],
    providers: [provideTranslations('process-services-cloud-extension-process-form', 'assets/process-services-cloud-extension-process-form')],
})
export class ProcessServicesCloudExtensionProcessFormFeatureShellModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'process-services-cloud.process-services-cloud.sidenav': SidenavProcessManagementComponent,
        });
    }
}
