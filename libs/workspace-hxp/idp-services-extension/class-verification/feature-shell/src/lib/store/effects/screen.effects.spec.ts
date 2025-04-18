/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { merge, Observable, of } from 'rxjs';
import { ScreenEffects } from './screen.effects';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockIdpRejectReasons } from '../../models/mocked/mocked-reject-reasons';
import { hot, cold, getTestScheduler } from 'jasmine-marbles';
import {
    ContentFileReference,
    IdpBackendService,
    IdpConfiguration,
    IdpFileMetadata,
    ProcessTaskBackendService,
    TaskContext,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { NotificationService } from '@alfresco/adf-core';
import { IdpTaskData } from '../../models/screen-models';
import { selectTaskInfo } from '../selectors/screen.selectors';

describe('Screen Effect', () => {
    let actions$: Observable<any>;
    let effects: ScreenEffects;
    let store: MockStore;
    let processTaskService: jasmine.SpyObj<ProcessTaskBackendService>;

    const mockTaskData = {
        rejectReasons: mockIdpRejectReasons(),
        batchState: {
            documents: [{ id: 'd1', name: 'doc1', pages: [{ contentFileReferenceIndex: 0, sourcePageIndex: 0 }] }],
            contentFileReferences: [{ sys_id: 'cf1' }],
        },
        sys_task_assignee: 'test-user',
    };

    const mockIdpConfiguration: IdpConfiguration = {
        classification: {
            classificationConfidenceThreshold: 0.5,
            documentClassDefinitions: [
                {
                    id: 'payslips',
                    name: 'Payslips',
                    description: 'You guessed it! Payslips!',
                },
            ],
        },
        extraction: {
            fieldDefinitionsByClass: [],
        },
    };

    const rootProcessInstanceId = 'root-1';
    const taskContext: TaskContext = {
        appName: 'test-app',
        taskId: '123',
        taskName: 'ClassifyDocs',
        rootProcessInstanceId: '',
        processInstanceId: '1',
        canClaimTask: false,
        canUnclaimTask: true,
    };
    const taskContextUpdated: TaskContext = { ...taskContext, rootProcessInstanceId: rootProcessInstanceId };

    const fileMetaData: IdpFileMetadata = {
        status: 'Processing',
        pageCount: 2,
        pages: [
            {
                pageIndex: 0,
                imageWidth: 600,
                imageHeight: 800,
                rotationAngle: 0,
                skew: 0,
            },
            {
                pageIndex: 1,
                imageWidth: 600,
                imageHeight: 800,
                rotationAngle: 0,
                skew: 0,
            },
        ],
    };

    const idpBackendSpy = jasmine.createSpyObj(
        'IdpBackendService',
        {
            getFileMetadata$: of(fileMetaData),
        },
        {}
    );

    const notificationSpy = jasmine.createSpyObj(
        'NotificationService',
        {
            showError: {},
            showWarning: {},
            showInfo: {},
        },
        {}
    );

    beforeEach(() => {
        processTaskService = jasmine.createSpyObj(
            'ProcessTaskBackendService',
            {
                getTaskAssignee$: of('test-user'),
                getTaskInputData$: of(mockTaskData),
                getIdpConfiguration$: of(mockIdpConfiguration),
                getRootProcessInstanceId$: of(rootProcessInstanceId),
                completeTask$: of({}),
                saveTaskData$: of({}),
                claimTask$: of(true),
                unclaimTask$: of(true),
                getTaskClaimProperties$: of({ success: true, canClaimTask: false, canUnclaimTask: true }),
            },
            {}
        );

        TestBed.configureTestingModule({
            providers: [
                ScreenEffects,
                provideMockActions(() => actions$),
                provideMockStore(),
                { provide: IdpBackendService, useValue: idpBackendSpy },
                { provide: NotificationService, useValue: notificationSpy },
                { provide: ProcessTaskBackendService, useValue: processTaskService },
            ],
        });

        effects = TestBed.inject(ScreenEffects);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should fetch task input and task configuration on screen load', () => {
        const expectedTaskData = { ...mockTaskData, configuration: mockIdpConfiguration.classification };
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadSuccess({ taskData: expectedTaskData, taskContext: taskContextUpdated });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    describe('should throw error on screen load when task input has no content files and batch state has no content files', () => {
        const cases = [
            { inputContents: [], batchContents: [] },
            { inputContents: undefined, batchContents: [] },
            { inputContents: [], batchContents: undefined },
            { inputContents: undefined, batchContents: undefined },
        ];

        for (const { inputContents, batchContents } of cases) {
            it(`should handle inputContents: ${emptyToString(inputContents)} and batchContents: ${emptyToString(batchContents)}`, () => {
                const mockTaskDataWithoutContents = {
                    ...mockTaskData,
                    batchState: {
                        ...mockTaskData.batchState,
                        contentFileReferences: batchContents,
                    },
                    contents: inputContents,
                };

                processTaskService.getTaskInputData$.and.returnValue(of(mockTaskDataWithoutContents));
                const action = systemActions.screenLoad({ taskContext });
                const outcome = systemActions.screenLoadError({ error: jasmine.stringMatching(/.+/) as any });
                actions$ = hot('       -a-', { a: action });
                const expected = cold('-b-', { b: outcome });
                expect(expected).toBeTruthy();
                expect(effects.loadScreenEffect$).toBeObservable(expected);
            });
        }

        function emptyToString(contents: ContentFileReference[] | undefined): string {
            return contents === undefined ? 'undefined' : '[]';
        }
    });

    describe('should throw error on screen load when task input has content files but batch state has no content files and there are no valid documents', () => {
        function buildTitle(inputContentsString: string, batchContentsString: string, documentsString: string): string {
            return `should handle input contents ${inputContentsString}, batch state contents ${batchContentsString} and documents: ${documentsString}`;
        }

        const cases = [
            {
                title: buildTitle('[1]', '[]', '[]'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: [],
                documents: [],
            },
            {
                title: buildTitle('[1]', 'undefined', '[]'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: [],
            },
            {
                title: buildTitle('[2]', '[]', '[]'),
                inputContents: [{ sys_id: 'cf1' }, { sys_id: 'cf2' }],
                batchContents: [],
                documents: [],
            },
            {
                title: buildTitle('[1]', 'undefined', 'undefined'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: undefined,
            },
            {
                title: buildTitle('[1]', 'undefined', 'pages []'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: [{ id: 'd1', name: 'doc1', pages: [] }],
            },
            {
                title: buildTitle('[1]', 'undefined', 'pages undefined'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: [{ id: 'd1', name: 'doc1', pages: undefined }],
            },
            {
                title: buildTitle('[1]', 'undefined', 'deleted'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: [{ id: 'd1', name: 'doc1', markAsDeleted: true, pages: [{ contentFileReferenceIndex: 0, sourcePageIndex: 0 }] }],
            },
            {
                title: buildTitle('[1]', 'undefined', 'rejected'),
                inputContents: [{ sys_id: 'cf1' }],
                batchContents: undefined,
                documents: [{ id: 'd1', name: 'doc1', markAsRejected: true, pages: [{ contentFileReferenceIndex: 0, sourcePageIndex: 0 }] }],
            },
        ];

        for (const { title, inputContents, batchContents, documents } of cases) {
            it(title, () => {
                const taskDataWithContents = {
                    ...mockTaskData,
                    batchState: {
                        ...mockTaskData.batchState,
                        documents,
                        contentFileReferences: batchContents,
                    },
                    contents: inputContents,
                };

                processTaskService.getTaskInputData$.and.returnValue(of(taskDataWithContents));
                const action = systemActions.screenLoad({ taskContext });
                const outcome = systemActions.screenLoadError({ error: jasmine.stringMatching(/.+/) as any });
                actions$ = hot('       -a-', { a: action });
                const expected = cold('-b-', { b: outcome });
                expect(expected).toBeTruthy();
                expect(effects.loadScreenEffect$).toBeObservable(expected);
            });
        }
    });

    it('should emit screen load error action when task input data retrieval fails', () => {
        const error = new Error('Error fetching task data');
        processTaskService.getTaskInputData$.and.returnValue(cold('#', {}, error));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should emit screen load error action when task configuration retrieval fails', () => {
        const error = new Error('Error fetching task configuration');
        processTaskService.getIdpConfiguration$.and.returnValue(cold('#', {}, error));
        const action = systemActions.screenLoad({ taskContext });
        const outcome = systemActions.screenLoadError({ error });
        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.loadScreenEffect$).toBeObservable(expected);
    });

    it('should send errors to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'error';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showError).toHaveBeenCalled();
    });

    it('should send warnings to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'warn';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showWarning).toHaveBeenCalled();
    });

    it('should send info to notification service', () => {
        const severity: 'error' | 'info' | 'success' | 'warn' = 'info';
        const error = { severity: severity, message: 'Test Error' };
        actions$ = hot('a', { a: systemActions.notificationShow(error) });
        effects.notificationEffect$.subscribe(() => {});
        getTestScheduler().flush();
        expect(notificationSpy.showInfo).toHaveBeenCalled();
    });

    it('should handle task action error', () => {
        const error = new Error('Test Error');
        actions$ = hot('a', { a: systemActions.taskActionError({ error }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_ACTION_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should handle task cancel', () => {
        actions$ = hot('a', { a: userActions.taskCancel() });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Cancel' }) });
        expect(effects.cancelTaskEffect$).toBeObservable(expected);
    });

    it('should trigger task data preparation when task save action emits', () => {
        actions$ = hot('a', { a: userActions.taskSave() });
        const expected = cold('b', { b: systemActions.taskPrepareUpdate({ taskAction: 'Save' }) });
        expect(effects.saveTaskPrepareDataEffect$).toBeObservable(expected);
    });

    it('should trigger task data preparation when task complete action emits', () => {
        actions$ = hot('a', { a: userActions.taskComplete() });
        const expected = cold('b', { b: systemActions.taskPrepareUpdate({ taskAction: 'Complete' }) });
        expect(effects.completeTaskPrepareDataEffect$).toBeObservable(expected);
    });

    it('should make api call to save task when prepare update action emits with save action', () => {
        const testTaskData: IdpTaskData = { ...mockTaskData, configuration: mockIdpConfiguration.classification };
        const outcome = systemActions.taskActionSuccess({ action: 'Save' });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Save', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
        expect(processTaskService.saveTaskData$).toHaveBeenCalledWith(taskContext.appName, taskContext.taskId, {
            batchState: testTaskData.batchState,
            sys_task_assignee: testTaskData.sys_task_assignee,
        });
    });

    it('should make api call to complete task when prepare update action emits with complete action', () => {
        const testTaskData: IdpTaskData = { ...mockTaskData, configuration: mockIdpConfiguration.classification };
        const outcome = systemActions.taskActionSuccess({ action: 'Complete' });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
        expect(processTaskService.completeTask$).toHaveBeenCalledWith(taskContext.appName, taskContext.taskId, {
            batchState: testTaskData.batchState,
            sys_task_assignee: testTaskData.sys_task_assignee,
        });
    });

    it('should emit task action error when prepare update action emits neither save or complete action', () => {
        const testTaskData: IdpTaskData = { ...mockTaskData, configuration: mockIdpConfiguration.classification };
        const outcome = systemActions.taskActionError({ error: new Error('Unknown task action') });
        store.overrideSelector(selectTaskInfo, taskContext);
        actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdateSuccess({ taskAction: 'Cancel', taskData: testTaskData }) });
        const expected = cold('-b-', { b: outcome });
        expect(expected).toBeTruthy();
        expect(effects.taskActionEffect$).toBeObservable(expected);
    });

    it('should handle task claim', () => {
        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskClaimSuccess({ taskContext: { ...taskContext, canClaimTask: false, canUnclaimTask: true } }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when app name or task id is empty', () => {
        const cases = [
            { caseTaskContext: { appName: 'test-app-name', taskId: '' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: 'test-task-id' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: '' } as TaskContext },
        ];

        for (const { caseTaskContext } of cases) {
            actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext: caseTaskContext }) });
            const expected = cold('b', {
                b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
            });

            expect(effects.claimTaskEffect$).toBeObservable(expected);
        }
    });

    it('should return taskActionError from task claim when claimTask throws an error', () => {
        processTaskService.claimTask$.and.returnValue(cold('#', {}, new Error('Test Claim Error')));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Claim Error'), action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when claimTask$ is unsuccessful', () => {
        processTaskService.claimTask$.and.returnValue(of(false));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when getTaskClaimProperties$ throws an error', () => {
        processTaskService.getTaskClaimProperties$.and.returnValue(cold('#', {}, new Error('Test Claim Error')));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Claim Error'), action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task claim when getTaskClaimProperties$ is unsuccessful', () => {
        processTaskService.getTaskClaimProperties$.and.returnValue(of({ success: false }));

        actions$ = hot('       a', { a: systemActions.taskClaim({ taskContext }) });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Claim' }),
        });

        expect(effects.claimTaskEffect$).toBeObservable(expected);
    });

    it('should handle claim task action error', () => {
        const ogConsoleError = console.error;
        console.error = () => {};

        const error = new Error('Test Claim Error');

        const combined$ = merge(effects.taskActionErrorNotificationEffect$, effects.taskClaimErrorCancelTaskEffect$);

        actions$ = hot('       a', { a: systemActions.taskActionError({ error, action: 'Claim' }) });
        const expected = cold('(bc)', {
            b: systemActions.notificationShow({ severity: 'error', message: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_CLAIM_ERROR' }),
            c: systemActions.taskActionSuccess({ action: 'Cancel' }),
        });

        expect(combined$).toBeObservable(expected);

        console.error = ogConsoleError;
    });

    it('should handle task unclaim', () => {
        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Unclaim' }) });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task unclaim when app name or task id is empty', () => {
        const cases = [
            { caseTaskContext: { appName: 'test-app-name', taskId: '' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: 'test-task-id' } as TaskContext },
            { caseTaskContext: { appName: '', taskId: '' } as TaskContext },
        ];

        for (const { caseTaskContext } of cases) {
            store.overrideSelector(selectTaskInfo, caseTaskContext);

            actions$ = hot('       a', { a: systemActions.taskUnclaim() });
            const expected = cold('b', {
                b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Unclaim' }),
            });

            expect(effects.unclaimTaskEffect$).toBeObservable(expected);
        }
    });

    it('should return taskActionError from task unclaim when unclaimTask$ throws an error', () => {
        processTaskService.unclaimTask$.and.returnValue(cold('#', {}, new Error('Test Unclaim Error')));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: new Error('Test Unclaim Error'), action: 'Unclaim' }),
        });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should return taskActionError from task unclaim when unclaimTask$ is unsuccessful', () => {
        processTaskService.unclaimTask$.and.returnValue(of(false));

        store.overrideSelector(selectTaskInfo, taskContext);

        actions$ = hot('       a', { a: systemActions.taskUnclaim() });
        const expected = cold('b', {
            b: systemActions.taskActionError({ error: jasmine.stringMatching(/.+/) as any, action: 'Unclaim' }),
        });

        expect(effects.unclaimTaskEffect$).toBeObservable(expected);
    });

    it('should handle unclaim task action error', () => {
        const ogConsoleError = console.error;
        console.error = () => {};

        const error = new Error('Test Unclaim Error');
        actions$ = hot('       a', { a: systemActions.taskActionError({ error, action: 'Unclaim' }) });
        const expected = cold('b', {
            b: systemActions.notificationShow({ severity: 'error', message: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_UNCLAIM_ERROR' }),
        });
        expect(effects.taskActionErrorNotificationEffect$).toBeObservable(expected);

        console.error = ogConsoleError;
    });

    it('should emit show notification on screen load error', () => {
        const ogConsoleError = console.error;
        console.error = () => {};

        const error = new Error('Test Screen Load Error');
        actions$ = hot('       a', { a: systemActions.screenLoadError({ error }) });
        const expected = cold('b', { b: systemActions.notificationShow({ severity: 'error', message: error.message }) });
        expect(effects.screenLoadErrorNotificationEffect$).toBeObservable(expected);

        console.error = ogConsoleError;
    });

    it('should emit task cancel on screen load error', () => {
        console.error = () => {};

        const error = new Error('Test Screen Load Error');
        actions$ = hot('       a', { a: systemActions.screenLoadError({ error }) });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Cancel' }) });
        expect(effects.screenLoadErrorTaskCancelEffect$).toBeObservable(expected);
    });

    it('should trigger taskActionSuccess when taskClaimSuccess action emits', () => {
        actions$ = hot('a', { a: systemActions.taskClaimSuccess({ taskContext }) });
        const expected = cold('b', { b: systemActions.taskActionSuccess({ action: 'Claim' }) });
        expect(effects.taskActionClaimSuccessEffect$).toBeObservable(expected);
    });

    it('should trigger screenLoad when taskClaimSuccess action emits', () => {
        actions$ = hot('a', { a: systemActions.taskClaimSuccess({ taskContext }) });
        const expected = cold('b', { b: systemActions.screenLoad({ taskContext }) });
        expect(effects.taskClaimSuccessLoadScreenEffect$).toBeObservable(expected);
    });
});
