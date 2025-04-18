/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { documentFieldAdapter, initialDocumentFieldState } from '../states/document-field.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const documentFieldReducer = createReducer(
    initialDocumentFieldState,

    on(systemActions.documentLoad, (state, { fields }) => {
        const firstFieldRequiringReview = fields.find((field) => field.verificationStatus === IdpVerificationStatus.AutoInvalid) || fields[0];
        return {
            ...documentFieldAdapter.setAll(fields, state),
            selectedFieldId: firstFieldRequiringReview?.id,
            loadState: IdpLoadState.Loaded,
        };
    }),

    on(userActions.fieldSelect, (state, { fieldId }) => {
        for (const fid of state.ids) {
            const field = state.entities[fid];
            if (field) {
                const isSelected = fid.toString() === fieldId;
                if (field.isSelected !== isSelected) {
                    state = documentFieldAdapter.updateOne({ id: field.id, changes: { isSelected } }, state);
                }
            }
        }
        return {
            ...state,
            selectedFieldId: fieldId,
        };
    }),

    on(userActions.fieldValueUpdate, (state, { fieldId, value, boundingBox }) => {
        const field = state.entities[fieldId];
        return documentFieldAdapter.updateOne(
            {
                id: fieldId,
                changes: {
                    value,
                    // keep existing box if value did not change
                    boundingBox: boundingBox ?? (value === field?.value ? field.boundingBox : undefined),
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            },
            state
        );
    }),

    on(systemActions.movedToNextField, (state, { id }) => {
        return {
            ...state,
            selectedFieldId: id,
        };
    })
);
