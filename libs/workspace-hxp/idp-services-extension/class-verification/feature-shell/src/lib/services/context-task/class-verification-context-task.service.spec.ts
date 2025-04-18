/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, take } from 'rxjs';
import { ClassVerificationContextTaskService } from './class-verification-context-task.service';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { Action } from '@ngrx/store';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { selectAllDocumentClasses, selectDocumentCountInfo } from '../../store/selectors/document.selectors';
import { selectTaskInfo } from '../../store/selectors/screen.selectors';
import { resetMockStore } from '../../store/effects/document.effects.spec';

describe('ClassVerificationContextTaskService', () => {
    let service: ClassVerificationContextTaskService;
    let store: MockStore;

    const triggerAction$ = new Subject<Action>();
    const actions$ = triggerAction$.asObservable();

    const taskContext: TaskContext = {
        appName: 'testApp',
        taskId: '1',
        taskName: 'Test Task',
        rootProcessInstanceId: '123456',
        processInstanceId: '123',
        canClaimTask: true,
        canUnclaimTask: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                ClassVerificationContextTaskService,
                provideMockStore({
                    selectors: [
                        { selector: selectAllDocumentClasses, value: [] },
                        { selector: selectDocumentCountInfo, value: [] },
                        { selector: selectTaskInfo, value: taskContext },
                    ],
                }),
                provideMockActions(() => actions$),
            ],
        });

        service = TestBed.inject(ClassVerificationContextTaskService);
        store = TestBed.inject(MockStore);
        spyOn(store, 'dispatch');
        resetMockStore(store);
    });

    afterEach(() => {
        resetMockStore(store);
    });

    it('should claim task if task can be claimed', () => {
        const claimableTaskContext = {
            ...taskContext,
            canClaimTask: true,
        };
        service.initialize(claimableTaskContext);
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.taskClaim({ taskContext: claimableTaskContext }));
    });

    it('should initialize the task context if task cannot be claimed', () => {
        const claimableTaskContext = {
            ...taskContext,
            canClaimTask: false,
        };
        service.initialize(claimableTaskContext);
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.screenLoad({ taskContext: claimableTaskContext }));
    });

    it('should dispatch saveTask action', () => {
        service.saveTask();
        expect(store.dispatch).toHaveBeenCalledWith(userActions.taskSave());
    });

    it('should dispatch completeTask action', () => {
        service.completeTask();
        expect(store.dispatch).toHaveBeenCalledWith(userActions.taskComplete());
    });

    it('should dispatch cancelTask action', () => {
        service.cancelTask();
        expect(store.dispatch).toHaveBeenCalledWith(userActions.taskCancel());
    });

    it('should dispatch claimTask action', () => {
        service.claimTask(taskContext);
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.taskClaim({ taskContext }));
    });

    it('should dispatch unclaimTask action', () => {
        service.unclaimTask();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.taskUnclaim());
    });

    it('should destroy the task context', () => {
        service.destroy();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.screenUnload());
    });

    it('should emit taskAction$ when taskActionSuccess emits', () => {
        service.taskAction$.pipe(take(1)).subscribe((taskAction) => {
            expect(taskAction).toEqual('Save');
        });

        triggerAction$.next(systemActions.taskActionSuccess({ action: 'Save' }));
    });

    it('should emit taskAction$ error when taskActionError emits', () => {
        service.taskAction$.pipe(take(1)).subscribe((taskAction) => {
            expect(taskAction).toEqual('Error');
        });

        triggerAction$.next(systemActions.taskActionError({ error: 'Error' }));
    });

    it('should set default task name when task name is empty string', fakeAsync(() => {
        testTaskName('', 'IDP_CLASS_VERIFICATION.TASK_HEADER.TASK_NAME_VALUE');
    }));

    it('should set actual task name when task name is false', fakeAsync(() => {
        testTaskName('false', 'false');
    }));

    it('should set actual task name when task name is zero', fakeAsync(() => {
        testTaskName('0', '0');
    }));

    it('should set actual task name when task name is random', fakeAsync(() => {
        testTaskName('Random string with space ', 'Random string with space');
    }));

    const testTaskName = (taskName: string, expectedHeaderTaskName: string) => {
        let actualTaskInfo: any = {};
        store.overrideSelector(selectTaskInfo, { ...taskContext, taskName: taskName });
        store.refreshState();

        service.taskInfo$.subscribe((taskInfo) => {
            actualTaskInfo = taskInfo;
        });

        tick(1000);

        const taskNameProp = [...actualTaskInfo.props].find((p) => p.label === 'IDP_CLASS_VERIFICATION.TASK_HEADER.TASK_NAME');
        expect(taskNameProp.value).toBe(expectedHeaderTaskName);
    };
});
