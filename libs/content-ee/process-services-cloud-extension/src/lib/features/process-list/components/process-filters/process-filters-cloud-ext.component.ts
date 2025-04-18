/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel, ProcessFilterCloudModel, ProcessFiltersCloudComponent } from '@alfresco/adf-process-services-cloud';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { navigateToProcesses, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { FilterType } from '../../../../store/states/extension.state';
import { AsyncPipe } from '@angular/common';
import { ProcessFilterFeatureFlagService } from '../../../../services/process-filters.feature-flag.service';

@Component({
    standalone: true,
    imports: [AsyncPipe, ProcessFiltersCloudComponent],
    selector: 'apa-process-filters-ext',
    templateUrl: './process-filters-cloud-ext.component.html',
})
export class ProcessFiltersCloudExtComponent implements OnInit, OnDestroy {
    appName$: Observable<string>;
    currentFilter$: Observable<FilterParamsModel>;

    searchApiMethod$: Observable<'GET' | 'POST'> = of('GET');

    private onDestroy$ = new Subject<void>();
    private processFilterFeatureFlagService = inject(ProcessFilterFeatureFlagService);
    private store = inject(Store);

    constructor() {
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
        this.currentFilter$ = this.store.select(selectProcessManagementFilter);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onProcessFilterClick(filter: ProcessFilterCloudModel) {
        if (filter) {
            this.setProcessManagementFilter(filter);
            this.navigateToProcesses(filter.id);
        }
    }

    private setProcessManagementFilter(filter: ProcessFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter,
                },
            })
        );
    }

    private navigateToProcesses(filterId: string) {
        this.store.dispatch(
            navigateToProcesses({
                filterId,
            })
        );
    }

    onUpdatedFilter(updatedFilter: any): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: updatedFilter, canBeRefreshed: true }));
    }
}
