/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { documentReducer } from './document.reducer';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { initialDocumentState } from '../states/document.state';
import { IdpLoadState, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('documentReducer', () => {
    it('should return the initial state', () => {
        const state = documentReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialDocumentState);
    });

    it('should handle documentLoad action', () => {
        const documentState = {
            class: { id: 'someClassId', name: 'someClassName' },
            id: 'someId',
            name: 'someName',
            someKey: 'someValue',
            pages: [
                {
                    id: 'page1',
                    name: 'Page 1',
                    fileReference: 'fileRef1',
                    contentFileReferenceIndex: 0,
                    sourcePageIndex: 0,
                },
            ],
        };
        const action = systemActions.documentLoad({
            documentState,
            fields: [],
        });
        const expectedState = {
            ...initialDocumentState,
            ...documentState,
            loadState: IdpLoadState.Loaded,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle documentLoadError action', () => {
        const action = systemActions.documentLoadError({ error: 'Some error message' });
        const expectedState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Error,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle pageSelect action', () => {
        const pageId = 'page1';
        const action = userActions.pageSelect({ pageId });
        const expectedState = {
            ...initialDocumentState,
            selectedPageIds: [pageId],
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle rejectReasonUpdate action', () => {
        const reason: RejectReason = { id: '1', value: 'rejectReason' };
        const note = 'Rejected!';
        const action = userActions.rejectReasonUpdate({ rejectReasonId: reason.id, rejectNote: note });
        const expectedState = {
            ...initialDocumentState,
            rejectReasonId: reason.id,
            rejectNote: note,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });
});
