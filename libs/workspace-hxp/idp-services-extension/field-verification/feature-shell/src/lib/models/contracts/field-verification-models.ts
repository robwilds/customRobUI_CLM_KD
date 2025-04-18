/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ApiBaseDocument, ContentFileReference, TaskInput } from '@hxp/workspace-hxp/idp-services-extension/shared';

export interface FieldVerificationInput extends TaskInput {
    batchState: FieldVerificationBatchState;
    documentIndex: number;
}

export interface FieldDefinition {
    id: string;
    name: string;
    dataType: 'Alphanumeric';
    format: string;
    description: string;
}

export interface FieldVerificationBatchState {
    documents: ApiDocument[];
    extractionStatus?: 'Awaiting' | 'Extracted' | 'ReviewRequired';
    contentFileReferences?: ContentFileReference[];
}

export interface ApiDocument extends ApiBaseDocument {
    classId: string;
    extractionReviewStatus?: 'ReviewRequired' | 'ReviewNotRequired';
    fields?: ApiField[];
    markAsRejected?: boolean;
    rejectReasonId?: string;
    rejectNote?: string;
}

export interface ApiBoundingBox {
    pageIndex?: number;
    top: number;
    left: number;
    height: number;
    width: number;
}

export interface ApiField {
    id: string;
    name: string;
    value?: string;
    extractionConfidence?: number;
    extractionReviewStatus?: 'ReviewRequired' | 'ReviewNotRequired';
    boundingBox?: ApiBoundingBox;
}
