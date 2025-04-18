/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap, map } from 'rxjs/operators';
import { copyNotificationMessages } from './copy-notification-messages.config';
import { copySnackBarTypes } from './copy-snack-bar-types.model';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    DocumentService,
    DocumentType,
    HxpNotificationService,
    hasPermission,
    CopyStatus,
    DocumentPermissions,
    isDocumentParentFolder,
} from '@alfresco/adf-hx-content-services/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbData, BreadcrumbDataService, BreadcrumbEntry, BreadcrumbEntryTypes } from '../../../services/breadcrumb-data.service';
import { FolderBreadcrumbComponent } from '../../../components/folder-breadcrumb/folder-breadcrumb.component';
import { TreeSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { ScrollTrackerDirective } from '@hxp/workspace-hxp/content-services-extension/shared/util';

export interface CopyDialogData {
    parentDocument: Document;
    documentToCopy: Document;
}

@Component({
    selector: 'hxp-document-copy-dialog',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MatIconModule,
        MatInputModule,
        FolderBreadcrumbComponent,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TreeSkeletonLoaderComponent,
        ScrollTrackerDirective,
    ],
    templateUrl: './document-copy-dialog.component.html',
    styleUrls: ['./document-copy-dialog.component.scss'],
    providers: [BreadcrumbDataService],
})
export class DocumentCopyDialogComponent implements OnInit, OnDestroy {
    readonly copyDocumentForm = this._fb.group({
        copied_link: [''],
    });
    readonly copyDocument = this.copyDialogData.documentToCopy;
    readonly parentDocument = this.copyDialogData.parentDocument;
    public folder$: Observable<BreadcrumbEntry>;
    public readonly breadcrumbData$: Observable<BreadcrumbData | null>;
    protected isAvailable = false;
    protected isCopying = false;
    protected isLoading$ = this.breadcrumbDataService.isLoading$;
    private readonly folderSubject = new BehaviorSubject<BreadcrumbEntry>({ document: this.copyDocument, type: BreadcrumbEntryTypes.PARENT });
    private destroy$ = new Subject<void>();
    private currentDocument: Document = this.copyDocument;

    constructor(
        private readonly _fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public copyDialogData: CopyDialogData,
        private dialogRef: MatDialogRef<DocumentCopyDialogComponent>,
        private readonly breadcrumbDataService: BreadcrumbDataService,
        private hxpNotificationService: HxpNotificationService,
        private documentService: DocumentService,
        private translateService: TranslateService
    ) {
        this.folder$ = this.folderSubject.asObservable();
        this.breadcrumbData$ = this.folder$.pipe(
            filter((folder) => !!folder),
            switchMap((breadcrumbEntry) =>
                this.breadcrumbDataService.getBreadcrumbData(breadcrumbEntry).pipe(
                    tap((breadcrumbData: BreadcrumbData) => {
                        this.currentDocument = breadcrumbData.currentFolder;
                        if (this.checkAvailability(breadcrumbData?.currentFolder)) {
                            breadcrumbEntry.document = breadcrumbData.currentFolder;
                        }
                    })
                )
            ),
            map((breadcrumbData) => this.breadcrumbDataService.filterSubfolders(breadcrumbData, this.copyDocument))
        );

        this.dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => (this.isCopying = false),
            });
    }

    ngOnInit(): void {
        this.onSelectedFolder({ document: this.copyDocument, type: BreadcrumbEntryTypes.PARENT });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onCopy() {
        if (this.isAvailable) {
            this.folder$.pipe(take(1)).subscribe({
                next: (breadcrumbEntry) => this.performCopyAction(breadcrumbEntry.document),
            });
        }
    }

    onSelectedFolder(breadcrumbEntry: BreadcrumbEntry) {
        this.breadcrumbDataService.resetPagination();
        this.folderSubject.next(breadcrumbEntry);
    }

    onScroll(): void {
        this.breadcrumbDataService.handleLoadMore().subscribe({
            next: (loadMore: boolean) => {
                if (loadMore) {
                    this.folderSubject.next({
                        document: this.currentDocument,
                        type: BreadcrumbEntryTypes.SELF,
                    });
                }
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    private checkAvailability(folder: Document) {
        this.isAvailable = hasPermission(folder, DocumentPermissions.CREATE_CHILD);
        return this.isAvailable;
    }

    private performCopyAction(targetFolder: Document) {
        this.isCopying = true;
        this.documentService
            .copyDocument(
                this.copyDocument.sys_id || '',
                `${this.translateService.instant('COPY.DIALOG.FILE_NAME_PREFIX')} ${this.copyDocument.sys_name}` || '',
                targetFolder.sys_id || ''
            )
            .pipe(
                take(1),
                switchMap((response) => {
                    return this.documentService.updateDocument(response.document?.sys_id || '', {
                        sys_title: `${this.translateService.instant('COPY.DIALOG.FILE_NAME_PREFIX')} ${this.copyDocument.sys_name}`,
                    });
                })
            )
            .subscribe({
                next: () => {
                    this.displayNotificationMessage(CopyStatus.SUCCESS);
                },
                error: () => {
                    this.displayNotificationMessage(CopyStatus.ERROR);
                    this.isCopying = false;
                },
                complete: () => {
                    this.dialogRef.close();
                    if (isDocumentParentFolder(this.copyDocument, targetFolder)) {
                        this.documentService.requestReload();
                    }
                },
            });
    }

    private displayNotificationMessage(status: CopyStatus) {
        const fileTypeKey: DocumentType = this.copyDocument.sys_isFolderish ? 'FOLDER' : 'FILE';
        const messageKey = copyNotificationMessages[status][fileTypeKey];

        this.hxpNotificationService.openSnackBar(messageKey, copySnackBarTypes[status]);
    }
}
