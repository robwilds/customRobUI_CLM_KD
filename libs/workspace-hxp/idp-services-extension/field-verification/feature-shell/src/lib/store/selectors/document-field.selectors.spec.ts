/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { selectAllFields, selectFieldsWithIssue, selectActiveField } from './document-field.selectors';
import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { documentFieldAdapter } from '../states/document-field.state';

describe('DocumentField Selectors', () => {
    const initialDocFieldState = {
        loadState: IdpLoadState.NotInitialized,
        selectedFieldId: '2',
        entities: {},
        ids: [],
    };

    const finalDocFieldState = {
        loadState: IdpLoadState.Loaded,
        selectedFieldId: '1',
        ids: ['1', '2', '3', '4'],
        entities: {
            '1': {
                id: '1',
                name: 'Field 1',
                dataType: 'Alphanumeric' as const,
                format: '',
                verificationStatus: IdpVerificationStatus.AutoInvalid,
                confidence: 0.8,
                value: 'Value 1',
            },
            '2': {
                id: '2',
                name: 'Field 2',
                dataType: 'Alphanumeric' as const,
                format: '',
                verificationStatus: IdpVerificationStatus.AutoValid,
                confidence: 0.8,
                value: undefined,
            },
            '3': {
                id: '3',
                name: 'Field 3',
                dataType: 'Alphanumeric' as const,
                format: '',
                verificationStatus: IdpVerificationStatus.ManualInvalid,
                confidence: 0.8,
                value: 'Value 3',
            },
            '4': {
                id: '4',
                name: 'Field 4',
                dataType: 'Alphanumeric' as const,
                format: '',
                verificationStatus: IdpVerificationStatus.AutoValid,
                confidence: 0.8,
                value: 'Value 4',
            },
        },
    };

    it('should select all fields', () => {
        const result = selectAllFields.projector(finalDocFieldState, documentFieldAdapter.getSelectors().selectAll(finalDocFieldState));
        expect(result.length).toBe(4);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('2');
        expect(result[2].id).toBe('3');
        expect(result[3].id).toBe('4');
    });

    it('should select fields with issues', () => {
        const result = selectFieldsWithIssue.projector(
            selectAllFields.projector(finalDocFieldState, documentFieldAdapter.getSelectors().selectAll(finalDocFieldState))
        );
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('3');
    });

    it('should select the active field', () => {
        const result = selectActiveField.projector(
            selectAllFields.projector(finalDocFieldState, documentFieldAdapter.getSelectors().selectAll(finalDocFieldState))
        );
        expect(result).toBeDefined();
        expect(result?.id).toBe('1');
    });

    it('should return empty array when state is not initialized', () => {
        const result = selectAllFields.projector(initialDocFieldState, documentFieldAdapter.getSelectors().selectAll(initialDocFieldState));
        expect(result.length).toBe(0);
    });
});
