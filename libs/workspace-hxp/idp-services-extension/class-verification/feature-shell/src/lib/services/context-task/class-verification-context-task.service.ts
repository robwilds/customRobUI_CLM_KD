/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
    selectCanComplete,
    selectCanSave,
    selectCanUnclaim,
    selectRejectReasons,
    selectScreenReady,
    selectTaskInfo,
} from '../../store/selectors/screen.selectors';
import { selectAllDocumentClasses, selectDocumentCountInfo } from '../../store/selectors/document.selectors';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { IdpContextTaskBaseService, IdpTaskActions, RejectReason, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpTaskInfo } from '../../models/screen-models';
import { Actions, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ClassVerificationContextTaskService extends IdpContextTaskBaseService {
    override readonly taskInfo$: Observable<IdpTaskInfo>;
    override readonly taskAction$: Observable<IdpTaskActions>;
    override readonly screenReady$: Observable<boolean>;
    override readonly taskCanSave$: Observable<boolean>;
    override readonly taskCanComplete$: Observable<boolean>;
    override readonly taskCanUnclaim$: Observable<boolean>;
    override readonly rejectReasons$: Observable<RejectReason[]>;

    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);
    private readonly actions$ = inject(Actions);
    private readonly translateService = inject(TranslateService);

    constructor() {
        super();

        this.taskInfo$ = combineLatest([
            this.store.select(selectTaskInfo),
            this.store.select(selectDocumentCountInfo),
            this.store.select(selectAllDocumentClasses),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([taskInfo, documentCountInfo, documentClasses]) => {
                return {
                    taskId: taskInfo.taskId,
                    taskName: taskInfo.taskName,
                    taskType: taskInfo.taskName,
                    canClaimTask: taskInfo.canClaimTask,
                    canUnclaimTask: taskInfo.canUnclaimTask,
                    issuesToResolve: documentCountInfo.documentsWithIssues,
                    taskLabel: 'IDP_CLASS_VERIFICATION.TASK_HEADER.TITLE',
                    props: [
                        {
                            label: 'IDP_CLASS_VERIFICATION.TASK_HEADER.TASK_NAME',
                            value: taskInfo.taskName.trim() || this.translateService.instant('IDP_CLASS_VERIFICATION.TASK_HEADER.TASK_NAME_VALUE'),
                        },
                        { label: 'IDP_CLASS_VERIFICATION.TASK_HEADER.DOCUMENT_CLASSES', value: documentClasses.length },
                        { label: 'IDP_CLASS_VERIFICATION.TASK_HEADER.TOTAL_DOCUMENTS', value: documentCountInfo.totalDocuments },
                        { label: 'IDP_CLASS_VERIFICATION.TASK_HEADER.TOTAL_PAGES', value: documentCountInfo.totalPages },
                    ],
                };
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.taskAction$ = merge(
            this.actions$.pipe(
                ofType(systemActions.taskActionSuccess),
                map((a) => a.action)
            ),
            this.actions$.pipe(
                ofType(systemActions.taskActionError),
                map(() => 'Error' as const)
            )
        );

        this.screenReady$ = this.store.select(selectScreenReady).pipe(distinctUntilChanged());
        this.taskCanSave$ = this.store.select(selectCanSave).pipe(distinctUntilChanged());
        this.taskCanComplete$ = this.store.select(selectCanComplete).pipe(distinctUntilChanged());
        this.taskCanUnclaim$ = this.store.select(selectCanUnclaim).pipe(distinctUntilChanged());

        this.rejectReasons$ = this.store.select(selectRejectReasons);
    }

    override initialize(taskContext: TaskContext): void {
        if (taskContext.canClaimTask) {
            this.claimTask(taskContext);
        } else {
            this.store.dispatch(systemActions.screenLoad({ taskContext }));
        }
    }

    override destroy(): void {
        this.store.dispatch(systemActions.screenUnload());
    }

    override saveTask(): void {
        this.store.dispatch(userActions.taskSave());
    }

    override completeTask(): void {
        this.store.dispatch(userActions.taskComplete());
    }

    override cancelTask(): void {
        this.store.dispatch(userActions.taskCancel());
    }

    override claimTask(taskContext: TaskContext): void {
        this.store.dispatch(systemActions.taskClaim({ taskContext }));
    }

    override unclaimTask(): void {
        this.store.dispatch(systemActions.taskUnclaim());
    }
}
