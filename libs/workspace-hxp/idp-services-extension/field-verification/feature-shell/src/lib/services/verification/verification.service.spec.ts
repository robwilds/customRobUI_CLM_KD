/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { IdpVerificationService } from './verification.service';
import { IdpDocument, IdpField, IdpBoundingBox } from '../../models/screen-models';
import { DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { fieldVerificationRootState } from '../../store/shared-mock-states';
import { selectDocument } from '../../store/selectors/document.selectors';
import { userActions } from '../../store/actions/field-verification.actions';
import { RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('IdpVerificationService', () => {
    let service: IdpVerificationService;
    let store: MockStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                IdpVerificationService,
                provideMockStore({ initialState: fieldVerificationRootState }),
                { provide: DestroyRef, useValue: { onDestroy: () => of() } },
            ],
        });

        service = TestBed.inject(IdpVerificationService);
        store = TestBed.inject(MockStore);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should select document from store', () => {
        const document: IdpDocument = {
            id: '1',
            name: 'Test Document',
            class: { id: '1', name: 'Test Class' },
            pages: [],
            fields: [],
            hasIssue: false,
        };
        store.overrideSelector(selectDocument, document);

        service.document$.subscribe((doc) => {
            expect(doc).toEqual(document);
        });
    });

    it('should dispatch rejectReasonUpdate action', () => {
        const reason: RejectReason = { id: '1', value: 'Test Reason' };
        const note = 'Rejected!';
        const dispatchSpy = spyOn(store, 'dispatch');

        service.updateRejectReason(reason.id, note);

        expect(dispatchSpy).toHaveBeenCalledWith(userActions.rejectReasonUpdate({ rejectReasonId: reason.id, rejectNote: note }));
    });

    it('should dispatch fieldValueUpdate action', () => {
        const field: IdpField = {
            id: '1',
            value: 'Test Value',
            dataType: '',
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
            isSelected: false,
            hasIssue: false,
            name: '',
        };
        const boundingBox: IdpBoundingBox = { left: 0, top: 0, width: 100, height: 100, pageId: 'page1' };
        const dispatchSpy = spyOn(store, 'dispatch');

        service.updateField(field, boundingBox);

        expect(dispatchSpy).toHaveBeenCalledWith(
            userActions.fieldValueUpdate({
                fieldId: field.id,
                value: field.value ?? '',
                boundingBox,
            })
        );
    });

    it('should dispatch selectNextField action', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        service.selectNextField();
        expect(dispatchSpy).toHaveBeenCalledWith(userActions.selectNextField());
    });
});
