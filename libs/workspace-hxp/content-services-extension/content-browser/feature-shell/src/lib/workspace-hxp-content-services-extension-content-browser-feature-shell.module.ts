/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentBrowserComponent } from './components/content-browser/hxp-content-browser.component';
import { HxpSidenavComponent } from './components/sidenav/hxp-sidenav.component';
import { CoreModule, provideTranslations } from '@alfresco/adf-core';
import { WorkspaceHxpContentServicesExtensionSearchFeatureShellModule } from '@hxp/workspace-hxp/content-services-extension/search/feature-shell';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { HxPCreateDocumentButtonComponent } from './components/document-create/create-document-button/create-document-button.component';
import { IsFolderishDocumentPipe } from './components/content-browser/is-folderish-document.pipe';
import { FolderIconComponent, MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedHxpServicesModule } from '@hxp/shared-hxp/services';
import { ContentUploadDialogComponent } from './components/document-create/upload/upload-dialog/upload-dialog.component';
import { FeaturesDirective, NotFeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { ContentUploadPropertiesEditorComponent } from './components/document-create/upload/upload-properties-editor/upload-properties-editor.component';
import { ContentUploadListComponent } from './components/document-create/upload/upload-list/upload-list.component';
import { UploadSnackbarComponent } from './components/document-create/upload/upload-snackbar/snackbar/upload-snackbar.component';
import { UploadSnackbarListComponent } from './components/document-create/upload/upload-snackbar/snackbar-files-list/upload-snackbar-list.component';
import { UploadSnackbarListRowComponent } from './components/document-create/upload/upload-snackbar/snackbar-list-row/upload-snackbar-list-row.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { DocumentLocationPickerComponent } from './components/document-location-picker/document-location-picker.component';
import { HxPCreateFolderDialogComponent } from './components/document-create/create-folder/folder-create-dialog/folder-create-dialog.component';
import { WorkspaceHxpContentServicesExtensionSharedContentRepositoryModule } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/feature-shell';
import { WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';
import { MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorModule } from '@angular/material/paginator';
import { CancelFolderDialogComponent } from './components/document-create/create-folder/cancel-dialog/cancel-folder-dialog.component';
import {
    DocumentService,
    DocumentPropertiesService,
    PermissionLevelPipe,
    UserResolverPipe,
    HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE,
    HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE,
    DateTimeFormatPipe,
} from '@alfresco/adf-hx-content-services/services';
import {
    ContentTypeIconComponent,
    CONTEXT_MENU_ACTIONS_PROVIDERS,
    HxpBreadcrumbComponent,
    HxpDocumentTreeComponent,
    HxpPropertiesSidebarComponent,
    ManageVersionsSidebarComponent,
    SearchTermFilterComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DocumentCategoryPickerComponent } from './components/document-category-picker/document-category-picker.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { AdfEnterpriseAdfHxContentServicesModule } from '@alfresco/adf-hx-content-services';
import { UploadFileButtonComponent } from './components/document-create/upload/upload-button/upload-button.component';
import { ReplaceFileModule } from './components/document-create/replace-file/replace-file.module';
import { UploadManagerService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { ReplaceFileButtonComponentActionService } from './components/document-create/replace-file/replace-file-button/replace-file-button-component-action.service';
import { ExtensionService } from '@alfresco/adf-extensions';
import { CreateDocumentVersionButtonComponent } from './components/document-version/document-version.component';
import { CreateDocumentVersionActionService } from './components/document-version/document-version.service';
import { CheckInApi } from '@hylandsoftware/hxcs-js-client';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        WorkspaceHxpContentServicesExtensionSearchFeatureShellModule,
        HxpUploadModule,
        FolderIconComponent,
        MimeTypeIconComponent,
        AdfEnterpriseAdfHxContentServicesModule,
        MatIconModule,
        MatDialogModule,
        DocumentLocationPickerComponent,
        DocumentCategoryPickerComponent,
        WorkspaceHxpContentServicesExtensionSharedContentRepositoryModule,
        WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule,
        SharedHxpServicesModule.forContent({
            DocumentPropertiesService,
            DocumentService,
        }),
        FeaturesDirective,
        NotFeaturesDirective,
        OverlayModule,
        MatPaginatorModule,
        PermissionLevelPipe,
        MatTooltipModule,
        DocumentViewerComponent,
        SearchTermFilterComponent,
        HxpPropertiesSidebarComponent,
        HxpDocumentTreeComponent,
        HxpBreadcrumbComponent,
        ContentTypeIconComponent,
        HxpWorkspaceDocumentTreeComponent,
        ReplaceFileModule,
        UserResolverPipe,
        ManageVersionsSidebarComponent,
        UploadFileButtonComponent,
        UploadSnackbarComponent,
        UploadSnackbarListComponent,
        UploadSnackbarListRowComponent,
        UserResolverPipe,
        CreateDocumentVersionButtonComponent,
        DateTimeFormatPipe,
    ],
    declarations: [
        IsFolderishDocumentPipe,
        ContentBrowserComponent,
        HxPCreateDocumentButtonComponent,
        HxpSidenavComponent,
        ContentUploadDialogComponent,
        ContentUploadListComponent,
        ContentUploadPropertiesEditorComponent,
        HxPCreateFolderDialogComponent,
        CancelFolderDialogComponent,
    ],
    exports: [ContentBrowserComponent, HxpSidenavComponent],
    providers: [
        DocumentService,
        provideTranslations('content-services-extension-content-browser-feature-shell', 'assets/content-services-extension-content-browser'),
        provideTranslations('adf-enterprise-adf-hx-content-services-ui', 'assets/adf-enterprise-adf-hx-content-services-ui'),
        ...CONTEXT_MENU_ACTIONS_PROVIDERS,
        UploadManagerService,
        {
            provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
            useValue: { formFieldAppearance: 'fill' },
        },
        {
            provide: HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE,
            useExisting: ReplaceFileButtonComponentActionService,
        },
        {
            provide: HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE,
            useExisting: CreateDocumentVersionActionService,
        },
        CheckInApi,
    ],
})
export class WorkspaceHxpContentServicesExtensionContentBrowserFeatureShellModule {
    constructor(private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private readonly extensions: ExtensionService) {
        this.matIconRegistry.addSvgIcon('location_picker_folder_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/Folder.svg'));
        this.matIconRegistry.addSvgIcon('location_picker_pencil_icon', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/Pencil.svg'));

        this.extensions.setComponents({
            'document.create_version': CreateDocumentVersionButtonComponent,
        });
    }
}
