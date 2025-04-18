/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel, ProcessFilterCloudModel, ProcessFiltersCloudComponent } from '@alfresco/adf-process-services-cloud';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PROCESS_ROUTE } from '../../constants/extensions.const';
import { taskOrProcessFilterUpdate } from '../../store/process-service-cloud.actions';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProcessFilterFeatureFlagService } from '@alfresco/adf-process-services-cloud-extension';

@Component({
    standalone: true,
    imports: [ProcessFiltersCloudComponent, AsyncPipe],
    selector: 'hxp-sidenav-process-list',
    templateUrl: './sidenav-process-list.component.html',
})
export class SidenavProcessListComponent implements OnDestroy {
    @Input() appName = '';
    @Input() currentFilter: FilterParamsModel = {};

    searchApiMethod$: Observable<'GET' | 'POST'> = of('GET');

    private onDestroy$ = new Subject<void>();
    private processFilterFeatureFlagService = inject(ProcessFilterFeatureFlagService);

    constructor(private readonly router: Router, private store: Store) {
        this.searchApiMethod$ = this.processFilterFeatureFlagService.showNewFilters().pipe(
            map((showNewFilters) => {
                const method: 'POST' | 'GET' = showNewFilters ? 'POST' : 'GET';
                return method;
            }),
            takeUntil(this.onDestroy$)
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onProcessFilterClick(filter: ProcessFilterCloudModel) {
        if (!filter.id) {
            return;
        }
        void this.router.navigate([PROCESS_ROUTE], {
            queryParams: {
                filterId: filter.id,
            },
        });
    }

    onUpdatedFilter(updatedFilter: any): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: updatedFilter, canBeRefreshed: true }));
    }
}
