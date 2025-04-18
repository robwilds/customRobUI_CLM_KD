/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ViewerTextOnlyLayerComponent } from './viewer-text-only-layer.component';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerService } from '../services/viewer.service';
import { ResizeObserverService } from '../services/resize-observer.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getDefaultStateData, StateData } from '../models/state-data';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { HighlightPrimitive } from '../models/text-layer/highlight-primitive';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { ConfigDefault } from '../models/config-default';

class MockResizeObserverService implements Partial<ResizeObserverService> {
    observe = jasmine.createSpy('observe').and.returnValue(
        of({
            target: {
                getBoundingClientRect: jasmine.createSpy('getBoundingClientRect'),
            },
            contentRect: {
                width: 800,
                height: 600,
            },
        } as unknown as ResizeObserverEntry)
    );
    unobserve = jasmine.createSpy('unobserve');
}

class MockViewerLayerService implements Partial<ViewerLayerService> {
    registerLayer = jasmine.createSpy('registerLayer');
    unregisterLayer = jasmine.createSpy('unregisterLayer');
    getLayers() {
        return [{ type: ViewerLayerType.TextOnly, order: 1 }];
    }
}

class MockViewerTextLayerService implements Partial<ViewerTextLayerService> {
    initialize = jasmine.createSpy('initialize');
    onResize = jasmine.createSpy('onResize');
    setAutoNavigationToHighlight = jasmine.createSpy('setAutoNavigationToHighlight');
    scaledAllTextData$ = scaledAllTextData$.asObservable();
}

const scaledAllTextData$ = new Subject<HighlightPrimitive[]>();
const mockHighlightPrimitive = HighlightPrimitive.fromTextData({
    text: 'sample text',
    top: 10,
    left: 20,
    width: 30,
    height: 40,
    pageId: '1',
});

describe('ViewerTextOnlyLayerComponent', () => {
    let component: ViewerTextOnlyLayerComponent;
    let fixture: ComponentFixture<ViewerTextOnlyLayerComponent>;
    let viewerTextLayerService: ViewerTextLayerService;
    let resizeObserverService: ResizeObserverService;
    let mockViewerState$: BehaviorSubject<StateData>;

    const hostData: ViewerLayerHostData = {
        documentId: 'doc1',
        pageId: 'p1',
        contentNaturalWidth: 500,
        contentNaturalHeight: 1000,
    };

    beforeEach(() => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changeViewerState: jasmine.createSpy('changeViewerState'),
            datasource$: of({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1', name: 'Page 1', panelClasses: [] }],
                    },
                ],
                loadImageFn: () =>
                    of({
                        blobUrl: 'image-blob-url',
                        width: 1000,
                        height: 800,
                    }),
            }),
            viewerConfig: ConfigDefault,
        };
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: ViewerTextLayerService, useClass: MockViewerTextLayerService },
                { provide: ResizeObserverService, useClass: MockResizeObserverService },
                { provide: ViewerLayerService, useClass: MockViewerLayerService },
                { provide: ViewerService, useValue: mockViewerService },
            ],
        }).overrideComponent(ViewerTextOnlyLayerComponent, { set: { providers: [] } });

        fixture = TestBed.createComponent(ViewerTextOnlyLayerComponent);
        component = fixture.componentInstance;
        component.host = hostData;
        fixture.detectChanges();

        viewerTextLayerService = TestBed.inject(ViewerTextLayerService);
        resizeObserverService = TestBed.inject(ResizeObserverService);
    });

    afterEach(() => {
        mockViewerState$.complete();
    });

    it('should initialize with host data', () => {
        expect(component.host).toEqual(hostData);
        expect(viewerTextLayerService.initialize).toHaveBeenCalledWith(hostData);
    });

    it('should observe resize on AfterViewInit', () => {
        component.ngAfterViewInit();
        expect(resizeObserverService.observe).toHaveBeenCalled();
    });

    it('should unobserve resize on OnDestroy', () => {
        component.ngOnDestroy();
        expect(resizeObserverService.observe).toHaveBeenCalled();
    });

    it('should append text elements', fakeAsync(() => {
        const sizeChange = {
            contentRect: { width: 100, height: 200 },
        } as ResizeObserverEntry;
        (resizeObserverService.observe as jasmine.Spy).and.returnValue(of(sizeChange));

        mockViewerState$.next({ ...getDefaultStateData(ConfigDefault), currentLayer: ViewerLayerType.TextOnly });
        scaledAllTextData$.next([mockHighlightPrimitive]);
        tick(200);
        fixture.detectChanges();
        expect(component.containerElement?.nativeElement.innerHTML).toContain('sample text');
    }));
});
