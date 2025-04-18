/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel, TaskFilterCloudModel, TaskFiltersCloudComponent } from '@alfresco/adf-process-services-cloud';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { navigateToTasks, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { FilterType } from '../../../../store/states/extension.state';
import { AsyncPipe } from '@angular/common';
import { ProcessFilterFeatureFlagService } from '../../../../services/process-filters.feature-flag.service';

@Component({
    standalone: true,
    imports: [TaskFiltersCloudComponent, AsyncPipe],
    selector: 'apa-task-filters-cloud-ext',
    templateUrl: './task-filters-cloud-ext.component.html',
})
export class TaskFiltersCloudExtComponent implements OnInit, OnDestroy {
    private processFilterFeatureFlagService = inject(ProcessFilterFeatureFlagService);

    appName$: Observable<string>;
    currentTaskFilter$: Observable<FilterParamsModel>;

    searchApiMethod$: Observable<'GET' | 'POST'> = of('GET');

    private onDestroy$ = new Subject<void>();

    constructor(private store: Store<any>) {
        this.searchApiMethod$ = this.processFilterFeatureFlagService.showNewFilters().pipe(
            map((showNewFilters) => {
                const method: 'POST' | 'GET' = showNewFilters ? 'POST' : 'GET';
                return method;
            }),
            takeUntil(this.onDestroy$)
        );
    }

    ngOnInit() {
        this.appName$ = this.store.select(selectApplicationName);
        this.currentTaskFilter$ = this.store.select(selectProcessManagementFilter);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onTaskFilterClick(filter: TaskFilterCloudModel) {
        if (filter) {
            this.setProcessManagementFilter(filter);
            this.navigateToTasks(filter.id);
        }
    }

    private setProcessManagementFilter(filter: TaskFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.TASK,
                    filter,
                },
            })
        );
    }

    private navigateToTasks(filterId: string) {
        this.store.dispatch(
            navigateToTasks({
                filterId,
            })
        );
    }

    onUpdatedFilter(updatedFilter: any): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: updatedFilter, canBeRefreshed: true }));
    }
}
