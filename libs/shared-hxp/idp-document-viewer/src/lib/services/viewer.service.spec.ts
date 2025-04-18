/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ViewerService, DatasourceDefault } from './viewer.service';
import { Datasource } from '../models/datasource';
import { filter, firstValueFrom, of, withLatestFrom } from 'rxjs';
import { EventTypes } from '../models/events';
import { LayoutType, UserLayoutOptions } from '../models/layout';
import { ToolbarItemTypes } from '../models/toolbar';
import { ConfigOptions, ToolbarPosition } from '../models/config-options';
import { NotificationService } from '@alfresco/adf-core';
import { StateData } from '../models/state-data';

describe('ViewerService', () => {
    let service: ViewerService;
    const datasource: Datasource = {
        documents: [
            {
                id: '1',
                name: 'Document 1',
                pages: [
                    {
                        id: '1',
                        name: '1',
                        isSelected: false,
                    },
                    {
                        id: '2',
                        name: '2',
                        isSelected: false,
                    },
                    {
                        id: '3',
                        name: '3',
                        isSelected: false,
                    },
                    {
                        id: '4',
                        name: '4',
                        isSelected: false,
                    },
                ],
            },
        ],
        loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
        loadThumbnailFn: () => of(''),
    };

    const mockNotificationService = {
        showInfo: jasmine.createSpy(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ViewerService,
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        });
        service = TestBed.inject(ViewerService);
    });

    it('should have default datasource', () => {
        firstValueFrom(service.datasource$).then((ds) => {
            expect(ds).toEqual(DatasourceDefault);
        });
    });

    it('should update datasource', () => {
        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, rotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        firstValueFrom(service.datasource$).then((ds) => {
            expect(ds).toEqual(newDatasource);
        });

        firstValueFrom(service.viewerEvent$).then((event) => {
            expect(event.type).toEqual(EventTypes.DataSourceChanged);
            expect(event.data?.dataSourceRef[0].documentId).toEqual('doc_1');
            expect(event.data?.dataSourceRef[0].pageId).toEqual('page_1');
        });
    });

    it('should update zoom in to viewer state', () => {
        const newState = { currentZoomLevel: 150 };
        service.changeViewerState(newState, EventTypes.ZoomChanged);

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentZoomLevel).toBe(150);
        });
    });

    it('should change page selection', () => {
        service.changePageSelection({ pageIndex: 1, totalPages: 10 });

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toBe(1);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });
    });

    it('should return correct page count', () => {
        service.updateDataSource(datasource);
        firstValueFrom(service.totalPageCount$).then((pageCount) => {
            expect(pageCount).toBe(4);
        });
    });

    it('should change page selection with datasource having 4 pages and layout is grid', () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        firstValueFrom(service.viewerLayout$).then((state) => {
            expect(state.type).toBe(LayoutType.Grid);
            expect(state.availableActions.length).toBe(4);
            expect(state.availableActions.includes(ToolbarItemTypes.Zoom)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.Rotate)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.FullScreen)).toBeTrue();
            expect(state.rows).toBe(2);
            expect(state.columns).toBe(3);
        });
    });

    it('should update configuration provided with value', () => {
        const mockConfig: Partial<ConfigOptions> = {
            defaultLayoutType: { type: UserLayoutOptions.Grid },
            toolbarPosition: ToolbarPosition.Top,
        };
        service.updateConfiguration(mockConfig);

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Grid);
            expect(state.currentToolbarPosition).toBe(ToolbarPosition.Top);
        });
    });

    it('should change page selection with datasource having 4 pages and layout is horizontal', () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Single_Horizontal);

        firstValueFrom(service.viewerLayout$).then((state) => {
            expect(state.type).toBe(LayoutType.SingleScrollable);
            expect(state.availableActions.length).toBe(4);
            expect(state.availableActions.includes(ToolbarItemTypes.Zoom)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.Rotate)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.FullScreen)).toBeTrue();
            expect(state.rows).toBe(1);
            expect(state.columns).toBe(1);
        });
    });

    it('should handle zoom in change event and update layout accordingly', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);
        service.updateDataSource(datasource);

        service.changeViewerState({ currentZoomLevel: 125 }, EventTypes.ZoomChanged);
        service.changeViewerState({ currentZoomLevel: 150 }, EventTypes.ZoomChanged);

        tick(100);
        firstValueFrom(service.viewerEvent$.pipe(withLatestFrom(service.viewerLayout$))).then(([event, layout]) => {
            expect(event.type).toBe(EventTypes.ZoomChanged);
            expect(event.data?.newValue).toEqual({ currentZoomLevel: 100 });
            expect(layout.type).toBe(LayoutType.SingleScrollable);
            expect(mockNotificationService.showInfo).toHaveBeenCalled();
        });
    }));

    it('should handle zoom out change event and update layout accordingly', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.Single_Vertical);
        service.updateDataSource(datasource);

        service.changeViewerState({ currentZoomLevel: 75 }, EventTypes.ZoomChanged);
        service.changeViewerState({ currentZoomLevel: 50 }, EventTypes.ZoomChanged);

        tick(100);
        firstValueFrom(service.viewerEvent$.pipe(withLatestFrom(service.viewerLayout$))).then(([event, layout]) => {
            expect(event.type).toBe(EventTypes.LayoutChanged);
            expect(layout.type).toBe(LayoutType.Grid);
            expect(mockNotificationService.showInfo).toHaveBeenCalled();
        });
    }));

    it('should fire PageSelected change event when SinglePage is selected', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        service.updateDataSource(datasource);

        service.changeViewerState({ pageNavInfo: { currentPageIndex: 1, totalPages: 4 } }, EventTypes.PageSelected);

        tick(100);
        firstValueFrom(service.viewerEvent$.pipe(withLatestFrom(service.viewerLayout$))).then(([event, layout]) => {
            expect(event.type).toBe(EventTypes.PageSelected);
            expect((event.data?.newValue as StateData)?.pageNavInfo.currentPageIndex).toBe(1);
            expect((event.data?.newValue as StateData)?.pageNavInfo.totalPages).toBe(4);
            expect(layout.type).toBe(LayoutType.SinglePage);
        });
    }));

    it('should reset rotation when changeViewerState is called with EventTypes.PageSelected', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        const initialState = {
            currentRotation: 90,
            pageNavInfo: {
                currentPageIndex: 1,
                totalPages: 10,
            },
        };

        service.changeViewerState(initialState, EventTypes.ZoomChanged);
        tick(100);
        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentRotation).toBe(90);
        });

        const newState = {
            pageNavInfo: {
                currentPageIndex: 2,
                totalPages: 10,
            },
        };

        service.changeViewerState(newState, EventTypes.PageSelected);
        tick(100);
        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentRotation).toBe(0);
            expect(state.pageNavInfo.currentPageIndex).toBe(2);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });
    }));

    it('should change toolbar item selection state', () => {
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.selectedToolbarItems).toContain(ToolbarItemTypes.BestFit);
        });
    });

    it('should toggle toolbar item selection state', fakeAsync(() => {
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);

        tick(100);
        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.selectedToolbarItems).not.toContain(ToolbarItemTypes.BestFit);
        });
    }));

    it('should emit event when toolbar item selection state changes', () => {
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);

        firstValueFrom(service.viewerEvent$).then((event) => {
            expect(event.type).toBe(EventTypes.Resize);
        });
    });

    it('should change page by id', () => {
        service.updateDataSource(datasource);
        service.changePageById('2');

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toEqual(1);
        });
    });

    it('should ignore change page by invalid id', () => {
        service.updateDataSource(datasource);
        service.changePageById('10');

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toBeUndefined();
        });
    });

    it('should emit LayoutChanged event when layout changes', () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        firstValueFrom(service.viewerEvent$).then((event) => {
            if (event.type === EventTypes.LayoutChanged) {
                expect(event.type).toBe(EventTypes.LayoutChanged);
            }
        });
    });

    it('should change layout to Grid if multiple documents selected', () => {
        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
                {
                    id: 'doc_2',
                    name: 'Document 2',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        firstValueFrom(service.viewerEvent$.pipe(filter((event) => event.type === EventTypes.LayoutChanged))).then((event) => {
            expect((event.data?.newValue as StateData).currentLayout.type).toBe(UserLayoutOptions.Grid);
        });
    });

    it('should change layout to None if no documents selected', () => {
        const newDatasource: Datasource = {
            documents: [],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        firstValueFrom(service.viewerEvent$.pipe(filter((event) => event.type === EventTypes.LayoutChanged))).then((event) => {
            expect(event.type).toBe(EventTypes.LayoutChanged);
            expect((event.data?.newValue as StateData).currentLayout.type).toBe(UserLayoutOptions.None);
        });
    });

    it('should respect user selection if single document is selected', fakeAsync(() => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        tick(50);
        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };
        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Grid);
        });
        service.updateDataSource(newDatasource);
    }));

    it('should reset rotation, zoom and current page index on datasource change', () => {
        const newState = {
            currentZoomLevel: 150,
            currentRotation: 90,
            pageNavInfo: {
                currentPageIndex: 1,
                totalPages: 10,
            },
        };
        service.changeViewerState(newState, EventTypes.ZoomChanged);

        firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentZoomLevel).toBe(150);
            expect(state.currentRotation).toBe(90);
            expect(state.pageNavInfo.currentPageIndex).toBe(1);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });

        firstValueFrom(
            service.viewerEvent$.pipe(
                filter((event) => event.type === EventTypes.DataSourceChanged),
                withLatestFrom(service.viewerState$)
            )
        ).then(([, state]) => {
            expect(state.currentZoomLevel).toBe(100);
            expect(state.currentRotation).toBe(0);
            expect(state.pageNavInfo.currentPageIndex).toBe(undefined);
            expect(state.pageNavInfo.totalPages).toBe(4);
        });

        service.updateDataSource(datasource);
    });

    it('should emit the provided keyboard event through viewerKeyboardEvent$', () => {
        const testEvent = new KeyboardEvent('keydown', { key: 'Enter' });

        firstValueFrom(service.viewerKeyboardEvent$).then((receivedEvent) => {
            expect(receivedEvent).toBe(testEvent);
        });

        service.handleKeyboardEvent(testEvent);
    });
});
