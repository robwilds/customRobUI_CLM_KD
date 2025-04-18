/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { OnInit, Component, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { DocumentService, HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { catchError, filter, map, mergeMap, switchMap, take, takeUntil } from 'rxjs/operators';
import { AttachFileDialogData, SelectionMode } from '@hxp/shared-hxp/form-widgets/feature-shell';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { UploadSuccessData } from '@hxp/shared-hxp/services';
import { HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { STUDIO_HXP } from '@features';

export const CONTENT_REPOSITORY_DEFAULT_PATH = ROOT_DOCUMENT.sys_path as string;

@Component({
    standalone: false,
    selector: 'hxp-attach-file-dialog',
    templateUrl: './attach-file-dialog.component.html',
    styleUrls: ['./attach-file-dialog.component.scss'],
    host: { class: 'hxp-attach-file-dialog' },
    encapsulation: ViewEncapsulation.None,
})
export class AttachFileDialogComponent implements OnInit, OnDestroy {
    showDragAndDropPlaceholder = true;
    selectedTabIndex = 0;
    documentNavigationStack: Document[] = [];
    insideErrorMessage = '';

    destroyed$ = new Subject<boolean>();
    displayedDocumentSubject$ = new BehaviorSubject<Document | null>(null);
    displayedDocument$ = this.displayedDocumentSubject$.asObservable();

    fetchDocumentCollectionSubject$ = new BehaviorSubject<Document[] | null>(null);
    fetchDocumentCollection$ = this.fetchDocumentCollectionSubject$.asObservable();

    chosenDocuments$ = new BehaviorSubject<Document[]>([]);

    isAttachButtonDisabled$: Observable<boolean> = this.chosenDocuments$.pipe(
        map((chosenDocuments) => {
            return chosenDocuments.filter((document) => !document.sys_isFolderish);
        }),
        map((chosenDocuments) => {
            const selectionMode = this.data.selectionMode;
            return (
                (selectionMode === SelectionMode.single && chosenDocuments.length !== 1) ||
                (selectionMode === SelectionMode.multiple && chosenDocuments.length === 0)
            );
        })
    );

    isAttachFileWidgetDefaultFolderOn$: Observable<boolean>;
    isContentEnabled = true;

    constructor(
        private dialog: MatDialogRef<AttachFileDialogComponent>,
        private documentService: DocumentService,
        private uploadService: HxpUploadService,
        @Inject(MAT_DIALOG_DATA) public data: AttachFileDialogData,
        private readonly notificationService: HxpNotificationService,
        @Inject(FeaturesServiceToken) private readonly featuresService: IFeaturesService
    ) {
        this.isAttachFileWidgetDefaultFolderOn$ = this.featuresService.isOn$(STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER);
    }

    get isUploadTabSelected(): boolean {
        return this.selectedTabIndex === 1;
    }

    get isUploadEnabled(): boolean {
        return this.data?.isLocalUploadAvailable;
    }

    ngOnInit(): void {
        this.isAttachFileWidgetDefaultFolderOn$.subscribe((isFeatureFlagOn) => {
            if (!isFeatureFlagOn) {
                if (!this.data.isLocalUploadAvailable) {
                    this.data.defaultDocumentPath$ = of(CONTENT_REPOSITORY_DEFAULT_PATH);
                }
            } else {
                if (!this.data.isContentUploadAvailable) {
                    this.isContentEnabled = false;

                    if (this.data.isLocalUploadAvailable) {
                        this.selectedTabIndex = 1;
                    }
                }
            }

            this.data.defaultDocumentPath$
                .pipe(
                    mergeMap((defaultFolder) => {
                        if (defaultFolder) {
                            return this.getDocumentByPath(defaultFolder as string);
                        } else {
                            return of(null);
                        }
                    })
                )
                .subscribe(
                    (document) => {
                        if (document) {
                            this.checkDocumentPrimaryType(document);
                        } else {
                            this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_DOES_NOT_EXIST');
                            this.close();
                        }
                    },
                    () => {
                        this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_DOES_NOT_EXIST');
                        this.close();
                    }
                );
        });

        this.uploadService.fileUploadComplete
            .pipe(
                switchMap(() => this.getDocumentByPath(this.documentNavigationStack[this.documentNavigationStack.length - 1].sys_path as string)),
                filter((document) => !!document),
                takeUntil(this.destroyed$)
            )
            .subscribe((document) => {
                this.displayedDocumentSubject$.next(document);
            });

        this.fetchDocumentCollection$ = this.displayedDocumentSubject$.pipe(
            switchMap((currentDocument) => {
                return this.fetchChildren(currentDocument).pipe(
                    catchError((error) => {
                        console.error(error);
                        return of([]);
                    })
                );
            })
        );
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    onUploadStart(): void {
        this.showDragAndDropPlaceholder = false;
    }

    onSuccessUpload(uploadedFiles: UploadSuccessData<Document>): void {
        let uploadedDocument: Document;
        if (uploadedFiles.middlewareResults) {
            uploadedDocument = uploadedFiles.middlewareResults;
            this.chosenDocuments$.pipe(take(1)).subscribe((chosenDocuments) => {
                if (this.data.selectionMode === SelectionMode.single) {
                    this.chosenDocuments$.next([uploadedDocument]);
                } else if (this.data.selectionMode === SelectionMode.multiple) {
                    this.chosenDocuments$.next([...chosenDocuments, uploadedDocument]);
                }
            });
        }
    }

    onSelectedDocuments($event: Document[]): void {
        this.chosenDocuments$.next($event);
    }

    navigateForward(document: Document): void {
        if (document.sys_isFolderish) {
            this.displayedDocumentSubject$.next(document);
            this.documentNavigationStack.push(document);
        }
    }

    navigateBack(document: Document): void {
        this.chosenDocuments$.next([]);
        this.displayedDocumentSubject$.next(document);
        this.documentNavigationStack = this.documentNavigationStack.slice(0, this.documentNavigationStack.indexOf(document) + 1);
    }

    close(): void {
        this.dialog.close();
    }

    onAttachButtonClick(): void {
        this.chosenDocuments$.subscribe((chosenDocuments) => {
            this.data.selectionSubject$.next(chosenDocuments);
            this.close();
        });
    }

    onTabSelectionChange(tabIndex: number): void {
        this.selectedTabIndex = tabIndex;
    }

    private checkDocumentPrimaryType(document: Document | null): void {
        if (document) {
            if (document.sys_primaryType === ROOT_DOCUMENT.sys_primaryType) {
                document.sys_title = ROOT_DOCUMENT.sys_primaryType;
            }
            this.navigateForward(document);
        }
    }

    private getDocumentByPath(path: string): Observable<Document | null> {
        return this.documentService.getDocumentByPath(path).pipe(
            catchError((e) => {
                if (e.toString().includes('code 5')) {
                    this.notificationService.showError('ATTACH_FILE_DIALOG.CONTENT_SERVICE_UNAVAILABLE');
                } else if (e.toString().includes('code 403')) {
                    this.insideErrorMessage = 'ATTACH_FILE_DIALOG.FOLDER_ACCESS_DENIED';
                    return of(null);
                } else {
                    this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_NAME_DOES_NOT_EXIST', undefined, {
                        folderName: path.split('/').pop(),
                    });
                }
                this.close();
                return of({ sys_primaryType: 'SysFolder' });
            })
        );
    }

    private fetchChildren(document: Document | null): Observable<Document[]> {
        if (!document) {
            return of([]);
        }

        return this.documentService.getAllChildren(document.sys_id || '').pipe(
            map((result) => {
                return result.documents;
            }),
            catchError((error) => {
                console.error(error);
                return of([]);
            }),
            takeUntil(this.destroyed$)
        );
    }
}
