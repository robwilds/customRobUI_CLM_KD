/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export * from './lib/models/datasource';
export * from './lib/models/config-options';
export * from './lib/models/layout';
export { EventTypes as ViewerEventTypes, ViewerEvent, DocumentRef } from './lib/models/events';
export { ViewerLayerType } from './lib/models/viewer-layer';
export { ViewerOcrCandidate, ViewerTextData, ViewerTextHighlightData } from './lib/models/text-layer/ocr-candidate';
export { DrawStyles as ViewerTextHighlightState } from './lib/models/text-layer/drawing-config';

export * from './lib/idp-viewer/idp-viewer.component';
export * from './lib/viewer-empty/viewer-empty.component';
export * from './lib/viewer-footer/sticky-action/sticky-action.component';
export * from './lib/viewer-header/idp-viewer-header-projection.component';
export * from './lib/services/viewer-shortcut.service';
export { ToolbarComponent as IdpViewerToolbar } from './lib/viewer-toolbar/toolbar.component';
export * from './lib/viewer-text-layer/viewer-text-layer.component';
export * from './lib/directives/viewer-content-layer.directive';
