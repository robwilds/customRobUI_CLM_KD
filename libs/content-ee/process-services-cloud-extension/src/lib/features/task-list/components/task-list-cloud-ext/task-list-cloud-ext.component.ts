/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild, Input, OnChanges } from '@angular/core';
import { TaskFilterCloudModel, TaskListCloudSortingModel, TaskListCloudComponent, IdentityGroupModel } from '@alfresco/adf-process-services-cloud';
import { DataColumnComponent, DataColumnListComponent, PaginationComponent, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { Pagination } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { navigateToTaskDetails } from '../../store/actions/task-list-cloud.actions';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { TaskListActionMenuModel, TaskListActionType } from './task-list-cloud-ext-action.model';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { DynamicColumnComponent } from '@alfresco/adf-extensions';
import { ScrollContainerComponent } from '../../../../components/scroll-container/scroll-container.component';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        PaginationComponent,
        DataColumnComponent,
        NgIf,
        DynamicColumnComponent,
        DataColumnListComponent,
        NgForOf,
        TaskListCloudComponent,
        ScrollContainerComponent,
    ],
    selector: 'apa-task-list-cloud-ext',
    templateUrl: './task-list-cloud-ext.component.html',
    styleUrls: ['./task-list-cloud-ext.component.scss'],
    host: { class: 'apa-task-list-cloud-ext' },
})
export class TaskListCloudExtComponent implements OnInit, OnChanges, OnDestroy {
    private static TASK_DETAILS_TITLE = 'PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS';
    private static TASK_DETAILS_ICON = 'open_in_new';
    private static PROCESS_HISTORY_TITLE = 'PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.PROCESS_HISTORY';
    private static PROCESS_HISTORY_ICON = 'history';

    @ViewChild(TaskListCloudComponent)
    taskListCloudComponent: TaskListCloudComponent;

    @Input()
    currentFilter: TaskFilterCloudModel;

    @Input()
    searchApiMethod: 'GET' | 'POST' = 'GET';

    paginationPageSize = 10;
    supportedPageSizes$: Observable<any[]>;
    sortArray: TaskListCloudSortingModel[] = [];
    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    onDestroy$ = new Subject<void>();
    columns$: Observable<ExtensionColumnPreset[]>;
    isResizingEnabled = false;
    private performAction$ = new Subject<any>();

    private taskDetailsActionMenuModel: TaskListActionMenuModel = {
        key: TaskListActionType.TASK_DETAILS,
        icon: TaskListCloudExtComponent.TASK_DETAILS_ICON,
        title: TaskListCloudExtComponent.TASK_DETAILS_TITLE,
        visible: true,
    };

    private processHistoryActionMenuModel: TaskListActionMenuModel = {
        key: TaskListActionType.PROCESS_HISTORY,
        icon: TaskListCloudExtComponent.PROCESS_HISTORY_ICON,
        title: TaskListCloudExtComponent.PROCESS_HISTORY_TITLE,
        visible: true,
    };

    constructor(
        private extensions: ProcessServicesCloudExtensionService,
        private userPreferenceService: UserPreferencesService,
        private store: Store<any>,
        private router: Router
    ) {}

    ngOnInit() {
        this.fetchCloudPaginationPreference();
        if (this.currentFilter) {
            this.setSorting();
        }
        this.performContextActions();
        this.columns$ = this.extensions.getTasksColumns('default');
        this.isResizingEnabled = this.extensions.isColumnResizingEnabled('features.taskList.presets.column-resizing');
    }

    ngOnChanges(): void {
        if (this.currentFilter) {
            this.setSorting();
        }
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    onShowRowContextMenu(event: any) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: this.taskDetailsActionMenuModel,
                subject: this.performAction$,
            },
            {
                data: event.value.row['obj'],
                model: this.processHistoryActionMenuModel,
                subject: this.performAction$,
            },
        ];
    }

    navigateToTaskDetails(taskId: string) {
        this.store.dispatch(navigateToTaskDetails({ taskId }));
    }

    navigateToProcessHistory(processInstanceId: string) {
        void this.router.navigateByUrl(`/process-details-cloud?processInstanceId=${processInstanceId}`);
    }

    getCandidateGroups(): string {
        return this.currentFilter?.candidateGroups?.length
            ? this.currentFilter?.candidateGroups?.map((group: IdentityGroupModel) => group.name).join(',')
            : null;
    }

    isSortingChanged(): boolean {
        return this.sortArray[0]?.orderBy !== this.currentFilter?.sort || this.sortArray[0]?.direction !== this.currentFilter?.order;
    }

    fetchCloudPaginationPreference() {
        this.supportedPageSizes$ = this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).pipe(
            map((supportedPageSizes) => {
                if (typeof supportedPageSizes === 'string') {
                    return JSON.parse(supportedPageSizes);
                }
                return supportedPageSizes;
            })
        );

        if (this.taskListCloudComponent) {
            this.defaultPagination.maxItems = this.taskListCloudComponent.size;
            this.taskListCloudComponent.resetPagination();
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private setSorting() {
        if (this.isSortingChanged()) {
            this.sortArray = [
                new TaskListCloudSortingModel({
                    orderBy: this.currentFilter?.sort,
                    direction: this.currentFilter?.order,
                }),
            ];
        }
    }

    private performContextActions() {
        this.performAction$.pipe(takeUntil(this.onDestroy$)).subscribe((action: any) => {
            switch (action.model.key) {
                case TaskListActionType.TASK_DETAILS: {
                    this.navigateToTaskDetails(action.data.id);
                    break;
                }
                case TaskListActionType.PROCESS_HISTORY: {
                    this.navigateToProcessHistory(action.data.processInstanceId);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    reload() {
        this.taskListCloudComponent.reload();
    }
}
