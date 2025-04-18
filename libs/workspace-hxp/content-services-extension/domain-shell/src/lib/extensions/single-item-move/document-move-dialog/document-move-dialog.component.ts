/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { moveNotificationMessages } from './move-notification-messages.config';
import { moveSnackBarTypes } from './move-snack-bar-types.model';
import {
    DocumentService,
    DocumentType,
    HxpNotificationService,
    MoveStatus,
    hasPermission,
    DocumentPermissions,
} from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FolderBreadcrumbComponent } from '../../../components/folder-breadcrumb/folder-breadcrumb.component';
import { BreadcrumbData, BreadcrumbDataService, BreadcrumbEntry, BreadcrumbEntryTypes } from '../../../services/breadcrumb-data.service';
import { TreeSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { ScrollTrackerDirective } from '@hxp/workspace-hxp/content-services-extension/shared/util';

export interface MoveDialogData {
    parentDocument: Document;
    documentToMove: Document;
    shouldRefresh: boolean;
}

@Component({
    selector: 'hxp-document-move-dialog',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        FolderBreadcrumbComponent,
        TreeSkeletonLoaderComponent,
        ScrollTrackerDirective,
    ],
    templateUrl: './document-move-dialog.component.html',
    styleUrls: ['./document-move-dialog.component.scss'],
    providers: [BreadcrumbDataService],
})
export class DocumentMoveDialogComponent implements OnInit, OnDestroy {
    public readonly moveDocumentForm = this.formBuilder.group({
        target_folder_id: ['', Validators.required],
    });
    public readonly breadcrumbData$: Observable<BreadcrumbData | null>;

    protected isAvailable = false;
    protected isMoving = false;
    protected isLoading$ = this.breadcrumbDataService.isLoading$;

    protected moveDocument = this.dialogData.documentToMove;
    private readonly parentDocument = this.dialogData.parentDocument;
    private readonly shouldRefresh = this.dialogData.shouldRefresh ?? false;
    private readonly folderSubject = new BehaviorSubject<BreadcrumbEntry>({ document: this.moveDocument, type: BreadcrumbEntryTypes.PARENT });
    private destroy$ = new Subject<void>();
    private currentDocument: Document = this.dialogData.documentToMove;

    constructor(
        @Inject(MAT_DIALOG_DATA) private readonly dialogData: MoveDialogData,
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<DocumentMoveDialogComponent>,
        private readonly hxpNotificationService: HxpNotificationService,
        private readonly breadcrumbDataService: BreadcrumbDataService,
        private readonly documentService: DocumentService
    ) {
        this.breadcrumbData$ = this.folderSubject.asObservable().pipe(
            filter((folder) => !!folder),
            switchMap((breadcrumbEntry) =>
                this.breadcrumbDataService.getBreadcrumbData(breadcrumbEntry).pipe(
                    tap((breadcrumbData) => {
                        this.currentDocument = breadcrumbData.currentFolder;
                        if (this.checkMoveAvailability(breadcrumbData?.currentFolder)) {
                            breadcrumbEntry.document = breadcrumbData?.currentFolder;
                        }
                    })
                )
            ),
            map((breadcrumbData) => this.breadcrumbDataService.filterSubfolders(breadcrumbData, this.moveDocument))
        );

        this.dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => (this.isMoving = false),
            });

        this.checkMoveAvailability(this.parentDocument);
    }

    ngOnInit(): void {
        this.onSelectedFolder({ document: this.moveDocument, type: BreadcrumbEntryTypes.PARENT });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSelectedFolder(breadcrumbEntry: BreadcrumbEntry) {
        this.breadcrumbDataService.resetPagination();
        this.checkMoveAvailability(breadcrumbEntry.document);
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

    onMove() {
        this.folderSubject
            .asObservable()
            .pipe(
                take(1),
                filter((breadcrumbEntry) => Boolean(breadcrumbEntry.document.sys_id))
            )
            .subscribe({
                next: (breadcrumbEntry: BreadcrumbEntry) => {
                    this.performMoveAction(breadcrumbEntry.document);
                },
                error: () => {
                    this.displayNotificationMessage(MoveStatus.ERROR);
                },
            });
    }

    onClose(): void {
        this.dialogRef.close(false);
    }

    private performMoveAction(targetFolder: Document) {
        this.isMoving = true;
        this.documentService
            .moveDocument(this.moveDocument.sys_id || '', targetFolder.sys_id || '')
            .pipe(take(1))
            .subscribe({
                next: (status) => {
                    this.displayNotificationMessage(status);
                },
                error: () => {
                    this.displayNotificationMessage(MoveStatus.ERROR);
                    this.isMoving = false;
                },
                complete: () => {
                    this.dialogRef.close();
                    if (this.shouldRefresh) {
                        this.documentService.requestReload();
                    }
                },
            });
    }

    private displayNotificationMessage(status: MoveStatus) {
        const fileTypeKey: DocumentType = this.moveDocument.sys_isFolderish ? 'FOLDER' : 'FILE';
        const messageKey = moveNotificationMessages[status][fileTypeKey];

        this.hxpNotificationService.openSnackBar(messageKey, moveSnackBarTypes[status]);
    }

    private checkMoveAvailability(parentDocument: Document) {
        this.isAvailable = hasPermission(parentDocument, DocumentPermissions.CREATE_CHILD);
        if (this.isAvailable && (this.moveDocument.sys_parentId === parentDocument?.sys_id || this.moveDocument.sys_id === parentDocument?.sys_id)) {
            this.isAvailable = false;
        }
        return this.isAvailable;
    }
}
