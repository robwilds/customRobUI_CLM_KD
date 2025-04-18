/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConfigOptions, LayoutState, ToolbarPosition } from './config-options';
import { ToolbarItemTypes, ZoomConfig } from './toolbar';
import { ViewerBaseLayerType, ViewerLayerType } from './viewer-layer';

export interface StateData {
    currentZoomLevel: number;
    currentRotation: number;
    currentLayout: LayoutState;
    currentToolbarPosition: ToolbarPosition;
    currentDocumentId: string | undefined;
    currentPageId: string | undefined;
    fullscreen: boolean;
    bestFit: boolean;
    pageNavInfo: {
        currentPageIndex: number | undefined;
        totalPages: number;
    };
    currentLayer: ViewerBaseLayerType;
    selectedToolbarItems: ToolbarItemTypes[];
    defaultZoomConfig: ZoomConfig;
}

export function getDefaultStateData(config: ConfigOptions): StateData {
    return {
        currentZoomLevel: config.defaultZoomLevel,
        currentRotation: 0,
        currentLayout: config.defaultLayoutType,
        currentToolbarPosition: config.toolbarPosition,
        currentDocumentId: undefined,
        currentPageId: undefined,
        fullscreen: false,
        bestFit: true,
        pageNavInfo: {
            currentPageIndex: undefined,
            totalPages: 0,
        },
        selectedToolbarItems: [ToolbarItemTypes.BestFit],
        defaultZoomConfig: config.defaultZoomConfig,
        currentLayer: ViewerLayerType.Image,
    };
}

export function isSameLayoutState(layout1: LayoutState | undefined, layout2: LayoutState | undefined) {
    return (
        layout1?.type === layout2?.type &&
        layout1?.override?.rows === layout2?.override?.rows &&
        layout1?.override?.columns === layout2?.override?.columns
    );
}
