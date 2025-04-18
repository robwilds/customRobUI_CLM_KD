/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    IdpViewerComponent,
    DatasourceOcr,
    RotationAngle,
    ToolbarPosition,
    ConfigOptions,
    UserLayoutOptions,
    ViewerTextLayerComponent,
    ViewerContentLayerDirective,
    ViewerTextData,
    ViewerTextHighlightState,
    ViewerEvent,
    ViewerTextHighlightData,
    ViewerOcrCandidate,
    ViewerEventTypes,
    ViewerLayerType,
} from '@hyland/idp-document-viewer';
import { TaskHeaderComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { MetadataPanelComponent } from '../metadata-panel/metadata-panel.component';
import { ActionHistoryService } from '../../services/action-history.service';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';
import { IdpDocument, IdpField } from '../../models/screen-models';
import { findOcrMatches, IdpVerificationService } from '../../services/verification/verification.service';

@Component({
    selector: 'hyland-idp-extraction-view',
    templateUrl: './extraction-view.component.html',
    styleUrls: ['./extraction-view.component.scss'],
    standalone: true,
    imports: [
        TaskHeaderComponent,
        MetadataPanelComponent,
        IdpViewerComponent,
        ViewerContentLayerDirective,
        ViewerTextLayerComponent,
        TranslateModule,
        AsyncPipe,
    ],
})
export class ExtractionViewComponent implements OnDestroy {
    readonly document$: Observable<IdpDocument>;
    readonly currentPageOcrWords$: Observable<ViewerOcrCandidate[]>;
    readonly viewerDatasource$: Observable<DatasourceOcr>;
    viewerHighlights: ViewerTextData[] = [];
    showTextLayer = true;

    readonly viewerTextSelected = new EventEmitter<ViewerTextHighlightData>();
    readonly fieldValuePending = new Subject<{ field: IdpField; pendingValue: string }>();
    readonly viewerEvent$ = new EventEmitter<ViewerEvent<object>>();

    readonly viewerConfiguration: Partial<ConfigOptions> = {
        toolbarPosition: ToolbarPosition.Right,
        defaultLayoutType: {
            type: UserLayoutOptions.SinglePage,
        },
    };

    constructor(
        destroyRef: DestroyRef,
        verificationService: IdpVerificationService,
        private readonly history: ActionHistoryService,
        private readonly imageLoadingService: IdpImageLoadingService
    ) {
        const getOcr$ = (pageId: string) => {
            return imageLoadingService.getPageOcrData$(pageId).pipe(
                takeUntilDestroyed(destroyRef),
                filter(isDefined),
                map((ocrData) =>
                    ocrData.words.map((w) => ({
                        ...w.boundingBox,
                        pageId,
                        text: w.text,
                    }))
                )
            );
        };

        this.document$ = verificationService.document$.pipe(takeUntilDestroyed(destroyRef));

        this.viewerDatasource$ = this.document$.pipe(
            map((document: IdpDocument) => {
                return {
                    id: document.id,
                    name: document.name,
                    pages: document.pages.map((page) => {
                        return {
                            id: page.id,
                            name: page.name,
                            rotation: RotationAngle.None,
                            isSelected: page.isSelected,
                            panelClasses: page.hasIssue ? ['idp-viewer__issue-page'] : [],
                        };
                    }),
                };
            }),
            map(
                (document) =>
                    ({
                        documents: [document],
                        loadImageFn: (pageId: string) => {
                            return imageLoadingService.getImageDataForPage$(pageId).pipe(filter(isDefined));
                        },
                        loadThumbnailFn: (pageId: string) => {
                            return imageLoadingService.getImageDataForPage$(pageId, true).pipe(
                                filter(isDefined),
                                map((data) => data.blobUrl)
                            );
                        },
                        loadPageOcrFn: getOcr$,
                        // eslint-disable-next-line prettier/prettier
                    } satisfies DatasourceOcr)
            )
        );

        const currentPageIndex$ = this.viewerEvent$.pipe(
            filter(isPageSelectedEvent),
            map((event) => event.data?.newValue?.pageNavInfo?.currentPageIndex),
            filter(isDefined),
            startWith(0) // start with first page by default
        );
        const currentPageId$ = combineLatest([currentPageIndex$, this.document$]).pipe(
            map(([index, document]) => document.pages[index].id),
            distinctUntilChanged()
        );
        this.currentPageOcrWords$ = currentPageId$.pipe(switchMap((pageId) => getOcr$(pageId)));

        let previousPageId: string | undefined;
        const activeFieldHighlight$ = combineLatest([verificationService.activeField$, currentPageId$]).pipe(
            map(([field, pageId]) => {
                const pageChanging = previousPageId !== pageId;
                previousPageId = pageId;

                if (!field?.boundingBox) {
                    return undefined; // no bounding box on this field
                }
                if (pageChanging && pageId !== field.boundingBox.pageId) {
                    return undefined; // moving to a different page
                }
                return {
                    ...field.boundingBox,
                    text: field.value ?? '',
                    highlightState: field.hasIssue ? ViewerTextHighlightState.INVALID : ViewerTextHighlightState.VALID,
                };
            })
        );

        const typeaheadHighlights$ = combineLatest([this.fieldValuePending, currentPageId$]).pipe(
            switchMap(([update, pageId]) => {
                if (!update?.pendingValue) {
                    return of([]); // no current typeahead
                }
                if (update.field.boundingBox && update.field.value === update.pendingValue) {
                    return of([]); // field already has matching box
                }
                return getOcr$(pageId).pipe(
                    map(function* (ocrWords) {
                        let index = 0;
                        for (const ocrMatch of findOcrMatches(ocrWords, update.pendingValue)) {
                            if (ocrMatch.length > 0) {
                                for (const word of ocrMatch) {
                                    yield {
                                        ...word,
                                        highlightState: index === 0 ? ViewerTextHighlightState.PRIMARY : ViewerTextHighlightState.SECONDARY,
                                    };
                                }
                                index++;
                            }
                        }
                    })
                );
            })
        );

        combineLatest([activeFieldHighlight$, typeaheadHighlights$])
            .pipe(
                map(([activeFieldHighlight, typeaheadHighlights]) => {
                    return [...(activeFieldHighlight ? [activeFieldHighlight] : []), ...typeaheadHighlights];
                }),
                takeUntilDestroyed(destroyRef)
            )
            .subscribe((viewerHighlights) => (this.viewerHighlights = viewerHighlights));

        // When the user selects some OCR text, update the active field value.
        this.viewerTextSelected
            .pipe(withLatestFrom(verificationService.activeField$), takeUntilDestroyed(destroyRef))
            .subscribe(([highlight, field]) => {
                if (field) {
                    const boundingBox = { ...highlight.rect.actual, pageId: highlight.pageId };
                    const updatedField = { ...field, value: highlight.text, boundingBox };
                    verificationService.updateField(updatedField, boundingBox);
                    this.fieldValuePending.next({ field: updatedField, pendingValue: updatedField.value });
                }
            });

        this.viewerEvent$
            .pipe(
                filter((event) => event.type === ViewerEventTypes.ViewChanged),
                map((event) => (event.data?.newValue as { currentLayer?: ViewerLayerType })?.currentLayer),
                distinctUntilChanged(),
                takeUntilDestroyed(destroyRef)
            )
            .subscribe((currentLayer) => {
                this.showTextLayer = currentLayer !== ViewerLayerType.TextOnly;
            });
    }

    ngOnDestroy() {
        this.imageLoadingService.cleanup();
    }

    @HostListener('keydown.control.z')
    onUndo() {
        this.history.undo();
    }
    @HostListener('keydown.control.y')
    @HostListener('keydown.control.shift.z')
    onRedo() {
        this.history.redo();
    }
}

function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

interface PageSelectedData {
    pageNavInfo: {
        currentPageIndex: number | undefined;
        totalPages: number;
    };
}
function isPageSelectedEvent(event: ViewerEvent<any>): event is ViewerEvent<PageSelectedData> {
    return event.type === 'PageSelected';
}
