/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Observable } from 'rxjs';
import { ViewerOcrCandidate } from './text-layer/ocr-candidate';

export interface IdpDocument {
    id: string;
    name: string;
    pages: IdpPage[];
}

export interface IdpPage {
    id: string;
    name: string;
    isSelected: boolean;
    panelClasses?: string[];
}

export enum RotationAngle {
    None = 0,
    Clockwise = 90,
    UpsideDown = 180,
    CounterClockwise = 270,
}

export interface ImageData {
    blobUrl: string;
    width: number;
    height: number;
    correctionAngle?: RotationAngle;
    viewerRotation?: RotationAngle;
    skew?: number;
}

export interface Datasource {
    documents: IdpDocument[];
    loadImageFn: (pageId: string) => Observable<ImageData> | Promise<ImageData> | ImageData;
    loadThumbnailFn: (pageId: string) => Observable<string> | Promise<string> | string;
}

export interface DatasourceOcr extends Datasource {
    loadPageOcrFn: (pageId: string) => Observable<ViewerOcrCandidate[]> | ViewerOcrCandidate[];
}

export function isDatasourceOcr(datasource: Datasource | DatasourceOcr): datasource is DatasourceOcr {
    return (datasource as DatasourceOcr).loadPageOcrFn !== undefined;
}
