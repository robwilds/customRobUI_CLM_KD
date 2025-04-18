/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    IdentifierData,
    IdpClassificationConfiguration,
    IdpExtractionConfiguration,
    IdpTaskInfoBase,
    IdpVerificationStatus,
    SomeRequired,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ApiBoundingBox, FieldVerificationBatchState, FieldVerificationInput } from './contracts/field-verification-models';

export type IdpTaskInfo = IdpTaskInfoBase;
export type IdpConfigClass = IdentifierData;

export type IdpTaskData = FieldVerificationInput & {
    batchState: SomeRequired<FieldVerificationBatchState, 'contentFileReferences'>;
    classificationConfiguration: IdpClassificationConfiguration;
    extractionConfiguration: IdpExtractionConfiguration;
};

export type IdpBoundingBox = ApiBoundingBox & {
    pageId: string;
};

export interface IdpField extends IdentifierData {
    dataType: string;
    format: string;
    confidence: number;
    verificationStatus: IdpVerificationStatus;
    value?: string;
    boundingBox?: IdpBoundingBox;
    isSelected?: boolean;
    hasIssue: boolean;
}

export interface IdpDocument extends IdentifierData {
    class: IdpConfigClass;
    pages: IdpDocumentPage[];
    fields: IdpField[];
    rejectReasonId?: string;
    markAsRejected?: boolean;
    rejectNote?: string;
    hasIssue: boolean;
}

export interface IdpDocumentPage extends IdentifierData {
    documentId: string;
    fileReference: string;
    sourcePageIndex: number;
    hasIssue: boolean;
    isSelected: boolean;
}
