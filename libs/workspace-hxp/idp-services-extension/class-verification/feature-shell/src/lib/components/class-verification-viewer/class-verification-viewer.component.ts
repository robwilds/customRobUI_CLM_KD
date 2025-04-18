/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnDestroy } from '@angular/core';
import { IdpDocumentService } from '../../services/document/idp-document.service';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IdpDocumentActionToolBarItems, IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { CommonModule } from '@angular/common';
import {
    Datasource,
    ImageData,
    RotationAngle,
    EmptyComponent,
    FooterStickyActionComponent,
    IdpViewerComponent,
    IdpViewerHeaderProjectionComponent,
    ViewerEvent,
    ViewerEventTypes,
} from '@hyland/idp-document-viewer';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';
import { IdpDocumentAction } from '../../models/screen-models';
import { ShortcutBrowserDialogComponent, TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

interface DocumentIssueState {
    resolveAction: IdpDocumentActionToolBarItems | undefined;
    showToolbar: boolean;
}

@Component({
    selector: 'hyland-idp-class-verification-viewer',
    templateUrl: './class-verification-viewer.component.html',
    styleUrls: ['./class-verification-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TemplateLetDirective,
        TranslateModule,
        EmptyComponent,
        IdpViewerComponent,
        IdpViewerHeaderProjectionComponent,
        FooterStickyActionComponent,
    ],
})
export class ClassVerificationViewerComponent implements OnDestroy {
    readonly datasource$: Observable<Datasource>;
    readonly allValid$: Observable<boolean>;
    readonly toolbarActionsItemState$: Observable<DocumentIssueState>;

    readonly viewerEventSubject$ = new Subject<ViewerEvent<object>>();
    readonly viewerEvent$ = this.viewerEventSubject$.asObservable();

    constructor(
        private readonly documentService: IdpDocumentService,
        private readonly documentToolbarService: IdpDocumentToolbarService,
        private readonly imageLoadingService: IdpImageLoadingService,
        private readonly destroyRef: DestroyRef,
        private readonly dialogService: MatDialog,
        private readonly injector: Injector
    ) {
        this.datasource$ = this.documentService.selectedDocuments$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((documents) => {
                const datasource: Datasource = {
                    documents:
                        documents?.map((doc) => ({
                            id: doc.id,
                            name: doc.name,
                            pages: doc.pages
                                .filter((p) => p.isSelected)
                                .map((page) => {
                                    return {
                                        id: page.id,
                                        name: page.name,
                                        rotation: RotationAngle.None,
                                        isSelected: page.isSelected || false,
                                        panelClasses: doc.hasIssue || page.hasIssue ? ['idp-viewer__issue-page'] : [],
                                    };
                                }),
                        })) || [],
                    loadImageFn: (pageId: string) => {
                        return this.imageLoadingService.getImageDataForPage$(pageId).pipe(
                            filter((imageInfo) => !!imageInfo),
                            map((imageInfo) => imageInfo as ImageData)
                        );
                    },
                    loadThumbnailFn: (pageId: string) => {
                        return this.imageLoadingService.getImageDataForPage$(pageId, true).pipe(
                            filter((imageInfo) => !!imageInfo),
                            map((imageInfo) => (imageInfo as ImageData).blobUrl)
                        );
                    },
                };
                return datasource;
            })
        );

        this.allValid$ = this.documentService.allDocumentsValid$.pipe(takeUntilDestroyed(this.destroyRef));

        this.toolbarActionsItemState$ = this.documentToolbarService.documentToolBarItems$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((items) => {
                const resolveAction = items.find((item) => item.action === IdpDocumentAction.Resolve);

                return {
                    resolveAction,
                    showToolbar: resolveAction?.disabled === false,
                };
            })
        );

        this.viewerEvent$
            .pipe(
                filter((event) => [ViewerEventTypes.FullScreenEnter, ViewerEventTypes.FullScreenExit].includes(event.type)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                this.documentService.changeFullScreen(event.type === ViewerEventTypes.FullScreenEnter);
            });
    }

    ngOnDestroy(): void {
        this.imageLoadingService.cleanup();
    }

    onShortcutBrowserClick(): void {
        if (this.dialogService.openDialogs.length > 0) {
            return;
        }

        ShortcutBrowserDialogComponent.openDialog(this.dialogService, { injector: this.injector });
    }
}
