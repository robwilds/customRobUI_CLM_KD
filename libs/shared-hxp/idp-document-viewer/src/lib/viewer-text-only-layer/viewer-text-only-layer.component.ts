/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Rect, TextRect } from '../models/text-layer/size';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerTextData } from '../models/text-layer/ocr-candidate';
import { ViewerService } from '../services/viewer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type TooltipInfo = TextRect & { rotation: number; scale: number };

const LAYER_TYPE = ViewerLayerType.TextOnly;

@Component({
    selector: 'hyland-idp-viewer-text-only-layer',
    templateUrl: './viewer-text-only-layer.component.html',
    styleUrls: ['./viewer-text-only-layer.component.scss'],
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerTextOnlyLayerComponent implements AfterViewInit, OnDestroy {
    @Input() host!: ViewerLayerHostData;
    @ViewChild('containerTexOnly') containerElement?: ElementRef<HTMLDivElement>;

    private readonly resized$ = new Subject<Rect>();
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerTextService: ViewerTextLayerService = inject(ViewerTextLayerService);
    private readonly viewerLayerService: ViewerLayerService = inject(ViewerLayerService);
    private readonly resizeObserverService: ResizeObserverService = inject(ResizeObserverService);
    readonly textUniquenessFn = (i: number, text: ViewerTextData) => `${text.height}+${text.width}+${text.left}+${text.top}`;
    textContents$: Observable<ViewerTextData[]>;

    constructor() {
        const registeredLayers = this.viewerLayerService.getLayers();
        if (!registeredLayers.some((layer) => layer.type === LAYER_TYPE)) {
            throw new Error(`${LAYER_TYPE} layer is not registered.`);
        }

        this.resized$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((rect) => {
            this.viewerTextService.onResize(rect);
        });

        this.textContents$ = combineLatest([
            this.viewerTextService.scaledAllTextData$,
            this.resized$,
            this.viewerService.viewerState$.pipe(
                map((state) => state.currentLayer),
                distinctUntilChanged()
            ),
        ]).pipe(
            debounceTime(50),
            takeUntilDestroyed(this.destroyRef),
            map(([textContents]) => {
                const bufferHeight = 5;
                return textContents.map((textContent) => {
                    const { left, top, height, width } = textContent.rect;
                    const { text, highlightState } = textContent.textData;
                    const fontSize = this.calculateFontSize(text, width, height);
                    return {
                        left,
                        top: top - bufferHeight,
                        height,
                        width,
                        text,
                        pageId: this.host.pageId,
                        highlightState,
                        additionalData: { fontSize },
                    };
                });
            })
        );
    }

    ngAfterViewInit(): void {
        this.initializeWithHost();
        this.observeResize();
    }

    ngOnDestroy(): void {
        if (this.containerElement?.nativeElement) {
            this.resizeObserverService.unobserve(this.containerElement.nativeElement);
        }
    }

    private initializeWithHost(): void {
        if (!this.host) {
            throw new Error(`"host" input is required for ${LAYER_TYPE} layer.`);
        }

        this.viewerTextService.initialize(this.host);
    }

    private observeResize(): void {
        if (!this.containerElement?.nativeElement) {
            return;
        }

        this.resizeObserverService.observe(this.containerElement.nativeElement).subscribe((sizeChange) => {
            const elementBoundingRect = sizeChange?.target?.getBoundingClientRect();
            const width = sizeChange?.contentRect.width ?? 0;
            const height = sizeChange?.contentRect.height ?? 0;
            const top = elementBoundingRect?.top ?? sizeChange?.contentRect.top ?? 0;
            const left = elementBoundingRect?.left ?? sizeChange?.contentRect.left ?? 0;

            if (width === 0 || height === 0) {
                return;
            }
            this.resized$.next({ width, height, top, left });
        });
    }

    private calculateFontSize(text: string, boxWidth: number, boxHeight: number, maxFontSize: number = 10, minFontSize: number = 4): number {
        const avgCharWidth = 0.5;
        const textWidth = text.length * avgCharWidth;
        const fontSize = Math.floor(boxWidth / textWidth);
        return Math.max(minFontSize, Math.min(fontSize, maxFontSize, boxHeight));
    }
}
