/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { documentFieldReducer } from './document-field.reducer';
import { documentFieldAdapter, initialDocumentFieldState } from '../states/document-field.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('documentFieldReducer', () => {
    it('should handle documentLoad action', () => {
        const fields = [
            {
                id: '1',
                name: 'field1',
                dataType: 'Alphanumeric',
                format: '',
                confidence: 0.8,
                value: 'val1',
                verificationStatus: IdpVerificationStatus.ManualValid,
            },
            {
                id: '2',
                name: 'field2',
                dataType: 'Alphanumeric',
                format: '',
                confidence: 0.9,
                value: 'val2',
                verificationStatus: IdpVerificationStatus.AutoInvalid,
            },
        ];

        const docEntity = {
            id: 'doc1',
            name: 'Document 1',
            class: { id: 'classA', name: 'Class A' },
            selectedPageIds: ['page1'],
            loadState: IdpLoadState.Loaded,
            pages: [
                { id: 'page1', name: 'Page 1', fileReference: 'file1', contentFileReferenceIndex: 0, sourcePageIndex: 0 },
                { id: 'page2', name: 'Page 2', fileReference: 'file2', contentFileReferenceIndex: 1, sourcePageIndex: 1 },
            ],
        };
        const action = systemActions.documentLoad({ documentState: docEntity, fields });
        const state = documentFieldReducer(initialDocumentFieldState, action);

        expect(state.selectedFieldId).toBe('2');
        expect(state.loadState).toBe(IdpLoadState.Loaded);
        expect(state.entities['1']).toEqual(fields[0]);
        expect(state.entities['2']).toEqual(fields[1]);
    });

    it('should handle fieldSelect action', () => {
        const initialState = {
            ...initialDocumentFieldState,
            selectedFieldId: '1',
        };
        const action = userActions.fieldSelect({ fieldId: '2' });
        const state = documentFieldReducer(initialState, action);

        expect(state.selectedFieldId).toBe('2');
    });

    it('should handle fieldValueUpdate action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    id: '1',
                    name: 'field1',
                    value: 'oldValue',
                    dataType: 'Alphanumeric',
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const boundingBox = { top: 0, left: 0, width: 100, height: 100, pageId: '2' };
        const action = userActions.fieldValueUpdate({ fieldId: '1', value: 'newValue', boundingBox });
        const state = documentFieldReducer(initialState, action);

        const updatedField = {
            id: '1',
            name: 'field1',
            value: 'newValue',
            dataType: 'Alphanumeric',
            format: '',
            confidence: 0.8,
            boundingBox,
            verificationStatus: IdpVerificationStatus.ManualValid,
        };

        expect(state.entities['1']).toEqual(updatedField);
    });
});
