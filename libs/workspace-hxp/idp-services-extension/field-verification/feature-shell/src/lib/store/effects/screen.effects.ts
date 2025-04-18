/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ProcessTaskBackendService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap, of, map, catchError, forkJoin, tap, filter, switchMap } from 'rxjs';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpTaskData } from '../../models/screen-models';
import { Store } from '@ngrx/store';
import { selectTaskInfo } from '../selectors/screen.selectors';
import { NotificationService } from '@alfresco/adf-core';
import { FieldVerificationInput } from '../../models/contracts/field-verification-models';

@Injectable()
export class ScreenEffects {
    constructor(
        private readonly actions$: Actions,
        private readonly processBackendService: ProcessTaskBackendService,
        private readonly store: Store,
        private readonly notificationService: NotificationService
    ) {}

    loadScreenEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoad),
            concatMap(({ taskContext }) => {
                return forkJoin([
                    taskContext.rootProcessInstanceId
                        ? of(taskContext.rootProcessInstanceId)
                        : this.processBackendService.getRootProcessInstanceId$(taskContext.appName, taskContext.processInstanceId),
                    this.processBackendService.getTaskInputData$<FieldVerificationInput>(taskContext.appName, taskContext.taskId),
                    this.processBackendService.getIdpConfiguration$(taskContext.appName),
                    this.processBackendService.getTaskAssignee$(taskContext.appName, taskContext.taskId),
                ]).pipe(
                    map(([rootProcessInstanceId, taskInput, idpConfiguration, assignee]) => {
                        if (
                            Number.isNaN(taskInput.documentIndex) ||
                            taskInput.documentIndex < 0 ||
                            taskInput.documentIndex >= taskInput.batchState.documents.length
                        ) {
                            throw new TypeError(`Invalid document index - ${taskInput.documentIndex}`);
                        }

                        taskContext = { ...taskContext, rootProcessInstanceId };

                        // input contents may contain a bunch of extra properties - take only what we need
                        const contentFileReferences = (taskInput.batchState.contentFileReferences ?? taskInput.contents)?.map(({ sys_id }) => ({
                            sys_id,
                        }));
                        if (!contentFileReferences) {
                            throw new Error('contentFileReferences not found in task input data');
                        }

                        const taskData: IdpTaskData = {
                            ...taskInput,
                            sys_task_assignee: assignee,
                            classificationConfiguration: idpConfiguration.classification,
                            extractionConfiguration: idpConfiguration.extraction,
                            batchState: {
                                ...taskInput.batchState,
                                contentFileReferences,
                            },
                        };

                        return systemActions.screenLoadSuccess({ taskData, taskContext });
                    }),
                    catchError((error) => of(systemActions.screenLoadError({ error })))
                );
            })
        )
    );

    screenLoadErrorNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadError),
            map(({ error }) => {
                console.error('Screen load error', typeof error === 'string' ? error : error.message);
                return systemActions.notificationShow({ severity: 'error', message: 'EXTRACTION.VERIFICATION.NOTIFICATIONS.SCREEN_LOAD_ERROR' });
            })
        )
    );

    saveTaskPrepareDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskSave),
            map(() => {
                return systemActions.taskPrepareUpdate({ taskAction: 'Save' });
            })
        )
    );

    completeTaskPrepareDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskComplete),
            map(() => {
                return systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
            })
        )
    );

    taskPrepareDataErrorEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdateError),
            map(({ error }) => {
                return systemActions.taskActionError({ error });
            })
        )
    );

    taskActionEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdateSuccess),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            concatMap(([{ taskAction, taskData }, taskContext]) => {
                if (!taskData) {
                    return of(systemActions.taskActionError({ error: new Error('No task data available') }));
                }

                switch (taskAction) {
                    case 'Save': {
                        return this.processBackendService
                            .saveTaskData$(taskContext.appName, taskContext.taskId, {
                                batchState: taskData.batchState,
                                sys_task_assignee: taskData.sys_task_assignee,
                            })
                            .pipe(
                                map(() => systemActions.taskActionSuccess({ action: 'Save' })),
                                catchError((error) => of(systemActions.taskActionError({ error })))
                            );
                    }
                    case 'Complete': {
                        return this.processBackendService
                            .completeTask$(taskContext.appName, taskContext.taskId, {
                                batchState: taskData.batchState,
                                sys_task_assignee: taskData.sys_task_assignee,
                            })
                            .pipe(
                                map(() => systemActions.taskActionSuccess({ action: 'Complete' })),
                                catchError((error) => of(systemActions.taskActionError({ error })))
                            );
                    }
                    default: {
                        return of(systemActions.taskActionError({ error: new Error('Unknown task action') }));
                    }
                }
            })
        )
    );

    cancelTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskCancel),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Cancel' });
            })
        )
    );

    taskActionErrorNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskActionError),
            map(({ error, action }) => {
                console.error('Task action error', typeof error === 'string' ? error : error.message);
                let message = '';
                switch (action) {
                    case 'Claim': {
                        message = 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_CLAIM_ERROR';
                        break;
                    }
                    case 'Unclaim': {
                        message = 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_UNCLAIM_ERROR';
                        break;
                    }
                    default: {
                        message = 'EXTRACTION.VERIFICATION.NOTIFICATIONS.TASK_ACTION_ERROR';
                        break;
                    }
                }
                return systemActions.notificationShow({ severity: 'error', message });
            })
        )
    );

    notificationEffect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(systemActions.notificationShow),
                tap(({ severity, message, messageArgs }) => {
                    switch (severity) {
                        case 'error': {
                            this.notificationService.showError(message, undefined, messageArgs);
                            break;
                        }
                        case 'warn': {
                            this.notificationService.showWarning(message, undefined, messageArgs);
                            break;
                        }
                        default: {
                            this.notificationService.showInfo(message, undefined, messageArgs);
                            break;
                        }
                    }
                })
            ),
        { dispatch: false }
    );

    claimTaskEffect$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(systemActions.taskClaim),
            concatMap(({ taskContext }) => {
                if (!taskContext.appName || !taskContext.taskId) {
                    const error = taskContext.appName ? 'Task Id is empty' : 'App Name is empty';
                    return of(systemActions.taskActionError({ error, action: 'Claim' }));
                }

                return this.processBackendService.claimTask$(taskContext.appName, taskContext.taskId).pipe(
                    switchMap((success) => {
                        return success
                            ? this.processBackendService.getTaskClaimProperties$(taskContext.appName, taskContext.taskId).pipe(
                                  map((result) => {
                                      return result.success
                                          ? systemActions.taskClaimSuccess({
                                                taskContext: {
                                                    ...taskContext,
                                                    canClaimTask: !!result.canClaimTask,
                                                    canUnclaimTask: !!result.canUnclaimTask,
                                                },
                                            })
                                          : systemActions.taskActionError({
                                                error: 'Failed to retrieve task claim properties',
                                                action: 'Claim',
                                            });
                                  }),
                                  catchError((error) => of(systemActions.taskActionError({ error, action: 'Claim' })))
                              )
                            : of(systemActions.taskActionError({ error: 'Failed to claim task', action: 'Claim' }));
                    }),
                    catchError((error) => of(systemActions.taskActionError({ error, action: 'Claim' })))
                );
            })
        );
    });

    taskClaimSuccessLoadScreenEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskClaimSuccess),
            map(({ taskContext }) => {
                return systemActions.screenLoad({ taskContext });
            })
        )
    );

    taskActionClaimSuccessEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskClaimSuccess),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Claim' });
            })
        )
    );

    taskClaimErrorCancelTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskActionError),
            filter(({ action }) => action === 'Claim'),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Cancel' });
            })
        )
    );

    unclaimTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskUnclaim),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            concatMap(([, taskContext]) => {
                if (!taskContext.appName || !taskContext.taskId) {
                    const error = taskContext.appName ? 'Task Id is empty' : 'App Name is empty';
                    return of(systemActions.taskActionError({ error, action: 'Unclaim' }));
                }

                return this.processBackendService.unclaimTask$(taskContext.appName, taskContext.taskId).pipe(
                    map((success) => {
                        return success
                            ? systemActions.taskActionSuccess({ action: 'Unclaim' })
                            : systemActions.taskActionError({ error: 'Failed to unclaim the task', action: 'Unclaim' });
                    }),
                    catchError((error) => of(systemActions.taskActionError({ error, action: 'Unclaim' })))
                );
            })
        )
    );
}
