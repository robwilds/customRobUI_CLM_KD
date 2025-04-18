/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, Inject, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Subject, of, merge } from 'rxjs';
import { catchError, map, switchMap, takeUntil, finalize, debounceTime, filter } from 'rxjs/operators';
import { DEFAULT_REPOSITORY_ID, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { PageEvent } from '@angular/material/paginator';
import {
    DocumentService,
    HxpNotificationService,
    hasPermission,
    ActionContext,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    DocumentPermissions,
    DocumentRouterService,
    ManageVersionsButtonActionService,
} from '@alfresco/adf-hx-content-services/services';
import { PaginationOptions, PageSizeStorageService } from '@hxp/workspace-hxp/content-services-extension/shared/util';
import { ContentPropertyViewerActionService } from '@alfresco/adf-hx-content-services/ui';

@Component({
    standalone: false,
    selector: 'hxp-content-browser',
    templateUrl: './hxp-content-browser.component.html',
    styleUrls: ['./hxp-content-browser.component.scss'],
})
export class ContentBrowserComponent implements OnInit, OnChanges, OnDestroy {
    public documents: Document[] = [];
    public actionContext: ActionContext = { documents: [] };
    selectedFolderId$ = this.route.url.pipe(map((urlSegments = []) => (urlSegments.length > 0 ? urlSegments[0].path : '')));

    protected isLoading = false;
    protected selection: Document[] = [];
    protected document!: Document;
    protected isCreateDisabled: true | undefined = true;
    protected paginatorConfig = {
        offset: 0,
        totalCount: 0,
        pageSizeOptions: PaginationOptions,
    };
    protected pageSize: number;
    protected repositoryId: string = DEFAULT_REPOSITORY_ID;
    protected editablePropertiesSidebar = false;

    private readonly destroyed$: Subject<void> = new Subject<void>();
    private activeSortingOptions: Array<string> = [];

    constructor(
        private documentService: DocumentService,
        private route: ActivatedRoute,
        private documentRouterService: DocumentRouterService,
        private changeDetectorRef: ChangeDetectorRef,
        private hxpNotificationService: HxpNotificationService,
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private contentPropertyViewerActionService: ContentPropertyViewerActionService,
        private pageSizeStorageService: PageSizeStorageService,
        private manageVersionsButtonActionService: ManageVersionsButtonActionService
    ) {
        this.subscribeToShowPropertyPanelStatus();
        this.subscribeToShowVersionsPanelStatus();
        this.subscribeToDocumentUpdates();
    }

    ngOnInit() {
        this.pageSize = this.pageSizeStorageService.getSize();

        this.route.params
            .pipe(
                switchMap((params) => {
                    this.repositoryId = params['repositoryId'] || DEFAULT_REPOSITORY_ID;
                    const docId = params['id'] || ROOT_DOCUMENT.sys_id;
                    this.documentService.setCurrentRepository(this.repositoryId);
                    return this.documentService.getDocumentById(docId, this.repositoryId).pipe(
                        catchError((error) => {
                            if (error.response.status === 403 && docId === ROOT_DOCUMENT.sys_id) {
                                return of(ROOT_DOCUMENT);
                            }
                            throw error;
                        })
                    );
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: (doc) => {
                    this.document = doc;
                    this.resetPaginatorConfig();
                    this.fetchChildren();
                    this.checkCreatePermission();
                    this.documentService.notifyDocumentLoaded(this.document);
                    this.changeDetectorRef.detectChanges();
                },
                error: ({ response }) => {
                    this.hxpNotificationService.showError(
                        [401, 403].includes(response.status)
                            ? 'CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.' + response.status
                            : 'CONTENT_BROWSER.DOCUMENT.LOAD_ERROR.DEFAULT'
                    );
                },
            });

        merge(this.documentService.documentCreated$, this.documentService.documentDeleted$, this.documentService.documentRequestReload$)
            .pipe(debounceTime(1000), takeUntil(this.destroyed$))
            .subscribe(() => {
                this.documentService.clearSelectionDocumentList();
                this.fetchChildren();
            });
    }

    ngOnChanges(): void {
        this.checkCreatePermission();
        this.resetPaginatorConfig();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    handleCloseSidebarPanel(): void {
        if (this.actionContext.showPanel === 'property') {
            this.actionContext = { ...this.actionContext, showPanel: undefined };
            this.contentPropertyViewerActionService.execute(this.actionContext);
        }

        if (this.actionContext.showPanel === 'version') {
            this.actionContext = { ...this.actionContext, showPanel: undefined };
            this.manageVersionsButtonActionService.execute(this.actionContext);
        }
    }

    fetchChildren(sortOptions: string[] = []) {
        this.isLoading = true;
        this.documentService
            .getAllChildren(this.document.sys_id, {
                limit: this.pageSize,
                offset: this.paginatorConfig.offset,
                sort: sortOptions,
            })
            .pipe(
                catchError(() =>
                    of({
                        documents: [],
                        limit: 0,
                        offset: 0,
                        totalCount: 0,
                    })
                ),
                takeUntil(this.destroyed$),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: (result) => {
                    this.documents = result.documents;
                    this.paginatorConfig.totalCount = result.totalCount;
                },
                error: (error) => {
                    console.error(error);
                },
            });
    }

    handlePageEvent(page: PageEvent) {
        this.pageSize = page.pageSize;
        this.pageSizeStorageService.setSize(page.pageSize);
        this.paginatorConfig.offset = page.pageIndex * page.pageSize;
        this.fetchChildren(this.activeSortingOptions);
        this.documentService.clearSelectionDocumentList();
    }

    protected handleRowClicked(document: Document) {
        this.documentRouterService.navigateTo(document);
    }

    protected handleSortingClicked(options: string[]) {
        this.activeSortingOptions = options;
        this.fetchChildren(this.activeSortingOptions);
    }

    protected handleCurrentSelection(documents: Document[]) {
        this.selection = documents;
        this.editablePropertiesSidebar = this.selection.length > 0 ? hasPermission(this.selection[0], DocumentPermissions.READ_WRITE) : false;
        this.actionContext = {
            ...this.actionContext,
            parentDocument: this.document,
            documents: this.selection,
        };
    }

    private resetPaginatorConfig() {
        this.paginatorConfig.offset = 0;
    }

    private checkCreatePermission() {
        if (this.document) {
            // if the user can upload a document, the disabled property of the upload component needs to be undefined instead of true
            this.isCreateDisabled = hasPermission(this.document, DocumentPermissions.CREATE_CHILD) ? undefined : true;
        }
    }

    private subscribeToShowPropertyPanelStatus(): void {
        this.contentPropertyViewerActionService.showPropertyPanel$.pipe(takeUntil(this.destroyed$)).subscribe({
            next: (status) => {
                this.actionContext = { ...this.actionContext, showPanel: status ? 'property' : undefined };
            },
            error: (error) => console.error(error),
        });
    }

    private subscribeToShowVersionsPanelStatus(): void {
        this.manageVersionsButtonActionService.showVersionsPanel$.pipe(takeUntil(this.destroyed$)).subscribe({
            next: (status) => {
                this.actionContext = { ...this.actionContext, showPanel: status ? 'version' : undefined };
            },
            error: (error) => console.error(error),
        });
    }

    private subscribeToDocumentUpdates(): void {
        this.documentService.documentUpdated$
            .pipe(
                // TODO: https://hyland.atlassian.net/browse/HXCS-5714
                filter(
                    ({ document, updatedProperties }) =>
                        document !== null &&
                        (updatedProperties.has('sys_primaryType') ||
                            updatedProperties.has('sys_title') ||
                            updatedProperties.has('sysfile_blob') ||
                            updatedProperties.has('sysver_isCheckedIn'))
                ),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: ({ document }) => {
                    if (this.document && document) {
                        this.fetchChildren();
                    }
                },
                error: (error) => console.error(error),
            });
    }
}
