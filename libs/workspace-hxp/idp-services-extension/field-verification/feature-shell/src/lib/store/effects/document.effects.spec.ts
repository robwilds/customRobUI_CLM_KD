/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { DocumentEffects } from './document.effects';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { fieldVerificationRootState, taskContext, taskData, taskInputData } from '../shared-mock-states';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold, hot } from 'jasmine-marbles';
import { IdpVerificationStatus, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectDocument } from '../selectors/document.selectors';
import { selectTaskInputData } from '../selectors/screen.selectors';
import { IdpDocument, IdpField } from '../../models/screen-models';
import { selectAllFields, selectFieldsWithIssue } from '../selectors/document-field.selectors';
import { DocumentFieldEntity } from '../states/document-field.state';
import { DocumentEntity } from '../states/document.state';

describe('DocumentEffects', () => {
    let actions$: Observable<any>;
    let effects: DocumentEffects;
    let store: MockStore;

    const documentState: DocumentEntity = {
        id: 'doc1',
        name: 'Document 1',
        class: {
            id: 'class1',
            name: 'Class 1',
        },
        pages: [
            {
                id: 'page1',
                name: 'Page 1',
                fileReference: 'fileRef1',
                contentFileReferenceIndex: 0,
                sourcePageIndex: 1,
            },
        ],
    };
    const fields: DocumentFieldEntity[] = [
        {
            id: 'field1',
            name: 'Field 1',
            value: 'Value 1',
            dataType: '',
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
        {
            id: 'field2',
            name: 'Field 2',
            value: 'Value 2',
            dataType: '',
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
        {
            id: 'field3',
            name: 'Field 3',
            value: 'Value 3',
            dataType: '',
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentEffects, provideMockActions(() => actions$), provideMockStore({ initialState: fieldVerificationRootState })],
        });

        effects = TestBed.inject(DocumentEffects);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.resetSelectors();
        store.setState(fieldVerificationRootState);
    });

    it('should return documentLoad action with documentState and fields on screenLoadSuccess', () => {
        const action = systemActions.screenLoadSuccess({ taskContext: taskContext, taskData: taskData });
        actions$ = of(action);

        effects.loadDocumentEffect$.subscribe((result) => {
            const resultCorrect = 'documentState' in result && 'fields' in result;
            expect(resultCorrect).toBeTrue();
            const taskDocument = taskInputData.batchState.documents[taskInputData.documentIndex];
            if ('documentState' in result) {
                expect(result.documentState.id).toEqual(taskDocument.id);
                expect(result.documentState.class.id).toEqual(taskDocument.classId);
                expect(result.documentState.pages.length).toEqual(taskDocument.pages.length);
            }
            if ('fields' in result) {
                expect(result.fields.length).toEqual(taskDocument.fields?.length || 0);
            }
        });
    });

    it('should return documentLoadError action if document class is not found', () => {
        const testTaskData = {
            ...taskData,
            batchState: { ...taskData.batchState, documents: [{ ...taskData.batchState.documents[0], classId: 'class2' }] },
        };
        const action = systemActions.screenLoadSuccess({ taskContext, taskData: testTaskData });
        const outcome = systemActions.documentLoadError({ error: 'Document class not found - class2' });

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentEffect$).toBeObservable(expected);
    });

    it('should return taskPrepareUpdateSuccess action with updated taskData having review not required status on taskPrepareUpdate when no field has issue', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [],
            hasIssue: false,
            fields:
                taskDocument.fields?.map((f) => ({
                    id: f.id,
                    name: f.name,
                    value: 'test',
                    hasIssue: false,
                    dataType: '',
                    format: '',
                    confidence: 1,
                    isSelected: false,
                    verificationStatus: IdpVerificationStatus.AutoValid,
                })) || [],
        };
        const expectedTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: taskData.batchState.documents.map((d) =>
                    d.id === taskDocument.id
                        ? {
                              ...d,
                              extractionReviewStatus: 'ReviewNotRequired' as const,
                              fields: d.fields?.map((f) => ({
                                  ...f,
                                  value: 'test',
                                  extractionConfidence: 1,
                                  boundingBox: undefined,
                                  extractionReviewStatus: 'ReviewNotRequired' as const,
                              })),
                          }
                        : d
                ),
                extractionStatus: 'Extracted' as const,
            },
        };

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
        const outcome = systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: expectedTaskData });

        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskDataEffect$).toBeObservable(expected);
    });

    it('should return taskPrepareUpdateSuccess action with updated taskData having review required status on taskPrepareUpdate when at least one field has issue', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [],
            hasIssue: false,
            rejectReasonId: taskDocument.rejectReasonId,
            markAsRejected: taskDocument.markAsRejected,
            fields:
                taskDocument.fields?.map((f) => ({
                    id: f.id,
                    name: f.name,
                    value: 'test',
                    hasIssue: true,
                    dataType: '',
                    format: '',
                    confidence: 1,
                    isSelected: false,
                    verificationStatus: IdpVerificationStatus.AutoValid,
                })) || [],
        };
        const expectedTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: taskData.batchState.documents.map((d) =>
                    d.id === taskDocument.id
                        ? {
                              ...d,
                              extractionReviewStatus: 'ReviewRequired' as const,
                              fields: d.fields?.map((f) => ({
                                  ...f,
                                  value: 'test',
                                  extractionConfidence: 1,
                                  boundingBox: undefined,
                                  extractionReviewStatus: 'ReviewRequired' as const,
                              })),
                          }
                        : d
                ),
                extractionStatus: 'ReviewRequired' as const,
            },
        };

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
        const outcome = systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: expectedTaskData });

        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskDataEffect$).toBeObservable(expected);
    });

    it('should return taskPrepareUpdateError action with error message on taskPrepareUpdate when task data is not found', () => {
        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
        const outcome = systemActions.taskPrepareUpdateError({ taskAction: 'Complete', error: 'Task data not found' });

        store.overrideSelector(selectDocument, {} as IdpDocument);
        // eslint-disable-next-line unicorn/no-useless-undefined
        store.overrideSelector(selectTaskInputData, undefined);

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.taskDataEffect$).toBeObservable(expected);
    });

    it('should return movedToNextField action with the first field with an issue on documentLoad', (done) => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: true,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0]]);
        const action = systemActions.documentLoad({ documentState, fields });
        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0]]);

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.selectInitialFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field2' }));
            done();
        });
    });

    it('should return movedToNextField action with the first field with no fields with issues on documentLoad', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, []);

        const action = systemActions.documentLoad({ documentState, fields });
        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, []);

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.selectInitialFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field1' }));
        });
    });

    it('should return movedToNextField action with the next field that has an issue on selectNextField', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: true,
                isSelected: true,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[2],
                hasIssue: true,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0], idpFields[2]]);
        const action = userActions.selectNextField();

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.moveNextFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field3' }));
        });
    });

    it('should return movedToNextField action with the first field in that has an issue after wraparound on selectNextField', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: true,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[2],
                hasIssue: true,
                isSelected: true,
            },
        ];

        store.overrideSelector(selectAllFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0], idpFields[2]]);
        const action = userActions.selectNextField();

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.moveNextFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field1' }));
        });
    });

    it('should complete the task when a reject reason is updated', () => {
        const reason: RejectReason = { id: '1', value: 'Image Blurry' };
        const rejectReasonAction = userActions.rejectReasonUpdate({ rejectReasonId: reason.id });
        const taskCompleteAction = userActions.taskComplete();

        actions$ = new Observable((observer) => {
            observer.next(rejectReasonAction);
            observer.complete();
        });

        effects.rejectBatchEffect$.subscribe((result) => {
            expect(result).toEqual(taskCompleteAction);
        });
    });
});
