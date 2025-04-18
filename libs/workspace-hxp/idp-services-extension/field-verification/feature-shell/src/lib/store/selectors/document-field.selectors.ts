/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { documentFieldAdapter } from '../states/document-field.state';
import { documentFieldFeatureSelector } from './field-verification-root.selectors';
import { IdpField } from '../../models/screen-models';
import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const selectAllFields = createSelector(
    documentFieldFeatureSelector,
    documentFieldAdapter.getSelectors(documentFieldFeatureSelector).selectAll,
    (state, fields) => {
        if (state.loadState === IdpLoadState.NotInitialized) {
            return [];
        }

        return fields.map<IdpField>((field) => {
            const hasIssue =
                field.verificationStatus === IdpVerificationStatus.AutoInvalid || field.verificationStatus === IdpVerificationStatus.ManualInvalid;

            return {
                id: field.id,
                name: field.name,
                dataType: field.dataType,
                format: field.format,
                hasIssue,
                verificationStatus: field.verificationStatus,
                confidence: field.confidence,
                value: field.value,
                boundingBox: field.boundingBox,
                isSelected: field.id === state.selectedFieldId,
            };
        });
    }
);

export const selectFieldsWithIssue = createSelector(selectAllFields, (fields) => fields.filter((field) => field.hasIssue));

export const selectActiveField = createSelector(selectAllFields, (fields) => {
    return fields.find((field) => field.isSelected);
});
