/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CoreModule, DecimalNumberPipe, SEARCH_TEXT_INPUT_DIRECTIVES } from '@alfresco/adf-core';
import { RouterModule } from '@angular/router';
import { EXTENSION_DIRECTIVES, ExtensionService } from '@alfresco/adf-extensions';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MimeTypeIconComponent, SearchActionIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatSelectModule } from '@angular/material/select';
import { FeaturesDirective, NotFeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkspaceHxpContentServicesExtensionSharedContentRepositoryModule } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/feature-shell';
import { WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';
import {
    AdfEnterpriseAdfHxContentServicesServicesModule,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    PermissionLevelPipe,
    SearchFilterContainerComponent,
} from '@alfresco/adf-hx-content-services/services';
import { MatDividerModule } from '@angular/material/divider';
import {
    ContentPropertyViewerActionService,
    ContentTypeIconComponent,
    HxpPropertiesSidebarComponent,
    ManageVersionsSidebarComponent,
    FormatDocumentPathDirective,
    CreatedDateSearchFiltersComponent,
    DocumentCategorySearchFiltersComponent,
    FileTypeSearchFilterComponent,
    SearchNoResultsComponent,
    FileTypeSearchFilterTreeComponent,
    SearchTermFilterComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { PageSizeStorageService } from '@hxp/workspace-hxp/content-services-extension/shared/util';
import { DocumentLocationSearchFilterComponent } from './components/filters/document-location/document-location-search-filter.component';
import { SearchMenuItemComponent } from './components/search-menu-item/search-menu-item.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        ...EXTENSION_DIRECTIVES,
        FeaturesDirective,
        NotFeaturesDirective,
        RouterModule,
        TranslateModule,
        ...SEARCH_TEXT_INPUT_DIRECTIVES,
        MatDividerModule,
        MatTabsModule,
        MatPaginatorModule,
        MatChipsModule,
        MatSelectModule,
        MatTreeModule,
        ReactiveFormsModule,
        OverlayModule,
        PortalModule,
        SearchActionIconComponent,
        WorkspaceHxpContentServicesExtensionSharedContentRepositoryModule,
        WorkspaceHxpContentServicesExtensionSharedContentRepositoryUiModule,
        PermissionLevelPipe,
        AdfEnterpriseAdfHxContentServicesServicesModule,
        DecimalNumberPipe,
        MatTooltipModule,
        MimeTypeIconComponent,
        SearchTermFilterComponent,
        SearchFilterContainerComponent,
        CreatedDateSearchFiltersComponent,
        DocumentLocationSearchFilterComponent,
        DocumentCategorySearchFiltersComponent,
        FileTypeSearchFilterComponent,
        FileTypeSearchFilterTreeComponent,
        HxpPropertiesSidebarComponent,
        ContentTypeIconComponent,
        ManageVersionsSidebarComponent,
        FormatDocumentPathDirective,
        SearchNoResultsComponent,
    ],
    declarations: [SearchMenuItemComponent, SearchResultsComponent],
    providers: [
        DatePipe,
        {
            provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
            useClass: ContentPropertyViewerActionService,
        },
        PageSizeStorageService,
        PermissionLevelPipe,
    ],
})
export class WorkspaceHxpContentServicesExtensionSearchFeatureShellModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'content-services-app.search-results': SearchResultsComponent,
            'content-services-app.search': SearchMenuItemComponent,
            'workspace-hxp-search-filter.created-date-filter': CreatedDateSearchFiltersComponent,
            'workspace-hxp-search-filter.document-category-filter': DocumentCategorySearchFiltersComponent,
            'workspace-hxp-search-filter.document-location-search-filter': DocumentLocationSearchFilterComponent,
            'workspace-hxp-search-filter.file-type-search-filter': FileTypeSearchFilterComponent,
        });
    }
}
