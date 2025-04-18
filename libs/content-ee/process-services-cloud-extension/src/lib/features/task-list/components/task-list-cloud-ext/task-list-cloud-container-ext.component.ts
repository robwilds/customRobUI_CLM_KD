/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, NotificationService } from '@alfresco/adf-core';
import { EditTaskFilterCloudComponent, TaskFilterAction, TaskFilterCloudModel, TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { switchMap, map, filter, take, takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { Subject, Observable, of, combineLatest } from 'rxjs';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { FilterType } from '../../../../store/states/extension.state';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { Filter } from '@alfresco-dbp/shared-filters-services';
import { TaskFilterService } from '../../services/task-filters/task-filter.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { FiltersContainerComponent } from '@alfresco-dbp/shared-filters-smart';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProcessFilterFeatureFlagService } from '../../../../services/process-filters.feature-flag.service';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        TaskListCloudExtComponent,
        EditTaskFilterCloudComponent,
        FiltersContainerComponent,
        DynamicExtensionComponent,
        PageLayoutContentComponent,
        NgIf,
        MatIconModule,
        TranslateModule,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
        MatButtonModule,
        MatDatepickerModule,
    ],
    selector: 'apa-task-list-cloud-container-ext',
    templateUrl: './task-list-cloud-container-ext.component.html',
    styleUrls: ['./task-list-cloud-container-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TaskListCloudContainerExtComponent implements OnInit, OnDestroy {
    static readonly TASK_FILTER_PROPERTY_KEYS = 'adf-edit-task-filter';
    public static readonly ACTION_SAVE = 'save';
    public static readonly ACTION_SAVE_AS = 'saveAs';
    public static readonly ACTION_DELETE = 'delete';

    @ViewChild('apaTaskListCloudExt')
    taskListExtCloudComponent: TaskListCloudExtComponent;

    appName: string;
    onDestroy$ = new Subject<void>();
    taskFilterProperties: any = {
        filterProperties: [],
        sortProperties: [],
        actions: [],
    };
    taskFilter: TaskFilterCloudModel;

    private readonly store = inject(Store);
    private readonly taskFilterService = inject(TaskFilterService);
    enableNotifications = false;

    private readonly processFilterFeatureFlagService = inject(ProcessFilterFeatureFlagService);
    showNewFilters$ = this.processFilterFeatureFlagService.showNewFilters();
    searchApiMethod$: Observable<'GET' | 'POST'> = of('GET');

    filters: Filter[] = [];
    isDefaultFilter = true;
    filtersLoading$ = this.taskFilterService.filtersLoading$;
    canListBeRefreshed: boolean;

    constructor(
        private readonly taskFilterCloudService: TaskFilterCloudService,
        private readonly route: ActivatedRoute,
        private readonly appConfig: AppConfigService,
        private readonly notificationService: NotificationService
    ) {
        this.searchApiMethod$ = this.showNewFilters$.pipe(
            map((showNewFilters) => {
                const method: 'POST' | 'GET' = showNewFilters ? 'POST' : 'GET';
                return method;
            }),
            takeUntil(this.onDestroy$)
        );
    }

    ngOnInit() {
        this.store.select(selectIfCurrentFilterCanBeRefreshed).subscribe((canBeRefreshed) => {
            this.canListBeRefreshed = canBeRefreshed;
        });
        this.enableNotifications = this.appConfig.get('notifications', true);

        this.route.queryParams
            .pipe(
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([params, appName]) => {
                    this.appName = appName;
                    return combineLatest([this.loadFilter(appName, params), this.waitUntilProcessDefinitionsAreLoaded()]);
                }),
                tap(([taskFilter]) => {
                    this.setTaskFilter(taskFilter);
                    this.resetCurrentFilterRefreshStatus();
                }),
                switchMap(() => {
                    return this.taskFilterService.getFilters(this.taskFilter);
                }),
                takeUntil(this.onDestroy$)
            )
            .subscribe((filters) => {
                this.filters = filters;
                this.isDefaultFilter = this.taskFilterService.isDefaultFilter(this.taskFilter);
            });

        this.getEditFilterProperties();
    }

    ngOnDestroy() {
        this.resetCurrentFilterRefreshStatus();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onRefreshButtonClicked(): void {
        if (this.canListBeRefreshed) {
            this.refreshTaskList();
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        }
    }

    private refreshTaskList(): void {
        this.taskListExtCloudComponent.reload();
        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        this.resetCurrentFilterRefreshStatus();
        this.setRefreshedFilter();
    }

    onTaskFilterAction(filterAction: TaskFilterAction) {
        switch (filterAction.actionType) {
            case TaskListCloudContainerExtComponent.ACTION_DELETE: {
                this.taskFilterCloudService
                    .getTaskListFilters(this.appName)
                    .pipe(take(1), takeUntil(this.onDestroy$))
                    .subscribe((filters: TaskFilterCloudModel[]) => {
                        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
                        this.navigateToTaskFilter(filters[0].id);
                    });
                break;
            }
            case TaskListCloudContainerExtComponent.ACTION_SAVE:
            case TaskListCloudContainerExtComponent.ACTION_SAVE_AS: {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
                this.navigateToTaskFilter(filterAction.filter.id);
                break;
            }
            default: {
                break;
            }
        }
    }

    onFilterSave() {
        this.taskFilterService
            .saveFilter(this.taskFilter)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
                this.navigateToTaskFilter(this.taskFilter.id);
            });
    }

    onFilterSaveAs(newFilterName: string) {
        this.taskFilterService
            .saveFilterAs(this.taskFilter, newFilterName)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
                this.navigateToTaskFilter(this.taskFilter.id);
            });
    }

    onFilterDelete() {
        this.taskFilterService
            .deleteFilter(this.taskFilter)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe((appTaskFilters) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
                this.navigateToTaskFilter(appTaskFilters[0].id);
            });
    }

    onFilterChange(taskFilter: TaskFilterCloudModel) {
        this.taskListExtCloudComponent?.fetchCloudPaginationPreference();
        this.setTaskFilter(taskFilter);
    }

    onFiltersChange(filters: Filter[]) {
        this.taskListExtCloudComponent?.fetchCloudPaginationPreference();

        const taskFilter = this.taskFilterService.filterArrayToTaskFilterCloud(this.taskFilter, filters);
        this.setTaskFilter(taskFilter);
    }

    private setTaskFilter(taskFilter: TaskFilterCloudModel) {
        this.taskFilter = new TaskFilterCloudModel(taskFilter);
        this.setProcessManagementFilter(taskFilter);
    }

    private loadFilter(appName: string, params: Params): Observable<TaskFilterCloudModel> {
        const numberOfParams = Object.keys(params).length;
        const filterId = params['filterId'] || params['id'];

        if (numberOfParams === 0) {
            return this.getFirstTaskFilter(appName);
        } else if (numberOfParams === 1 && filterId) {
            return this.taskFilterCloudService.getTaskFilterById(appName, filterId);
        } else {
            return this.getMyTasksFilter(appName).pipe(
                map((myTasksModel) => {
                    return new TaskFilterCloudModel({
                        ...myTasksModel,
                        ...params,
                        appName,
                    });
                })
            );
        }
    }

    private getFirstTaskFilter(appName: string): Observable<TaskFilterCloudModel> {
        return this.taskFilterCloudService.getTaskListFilters(appName).pipe(map((filters) => filters[0]));
    }

    private getMyTasksFilter(appName: string): Observable<TaskFilterCloudModel> {
        return this.taskFilterCloudService.getTaskListFilters(appName).pipe(map((filters) => filters.find((f) => f.key === 'my-tasks')));
    }

    private showFilterNotification(key: string) {
        this.notificationService.showInfo(key);
    }

    private navigateToTaskFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    private setProcessManagementFilter(taskFilter: TaskFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.TASK,
                    filter: taskFilter,
                },
            })
        );
    }

    private getEditFilterProperties() {
        const properties = this.appConfig.get<Array<any>>(TaskListCloudContainerExtComponent.TASK_FILTER_PROPERTY_KEYS);
        if (properties) {
            this.taskFilterProperties = properties;
        }
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter((areDefinitionsLoaded) => !!areDefinitionsLoaded));
    }

    private resetCurrentFilterRefreshStatus() {
        this.store.dispatch(
            taskOrProcessFilterUpdate({
                filterKey: this.taskFilter.key,
                canBeRefreshed: false,
            })
        );
    }

    private setRefreshedFilter() {
        this.taskFilterCloudService.refreshFilter(this.taskFilter.key);
    }
}
