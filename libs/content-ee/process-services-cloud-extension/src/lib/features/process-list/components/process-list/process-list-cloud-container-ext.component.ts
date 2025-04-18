/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { switchMap, withLatestFrom, map, filter, take, takeUntil, tap } from 'rxjs/operators';
import {
    ProcessFilterCloudModel,
    ProcessFilterCloudService,
    ProcessFilterAction,
    PROCESS_FILTER_ACTION_DELETE,
    PROCESS_FILTER_ACTION_SAVE,
    PROCESS_FILTER_ACTION_SAVE_AS,
    EditProcessFilterCloudComponent,
} from '@alfresco/adf-process-services-cloud';
import { AppConfigService, NotificationService } from '@alfresco/adf-core';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { setProcessManagementFilter, navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import { ProcessCloudFilterAdapter } from '../../models/process-cloud-filter-adapter.model';
import { ProcessListCloudExtComponent } from './process-list-cloud-ext.component';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { ProcessFilterService } from '../../services/process-filters/process-filter.service';
import { Filter } from '@alfresco-dbp/shared-filters-services';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { FiltersContainerComponent } from '@alfresco-dbp/shared-filters-smart';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { ProcessFilterFeatureFlagService } from '../../../../services/process-filters.feature-flag.service';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        NgIf,
        MatButtonModule,
        PageLayoutContentComponent,
        FiltersContainerComponent,
        EditProcessFilterCloudComponent,
        ProcessListCloudExtComponent,
        DynamicExtensionComponent,
        TranslateModule,
        MatIconModule,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
    ],
    selector: 'apa-process-list-cloud-container-ext',
    templateUrl: './process-list-cloud-container-ext.component.html',
    styleUrls: ['./process-list-cloud-container-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProcessListCloudContainerExtComponent implements OnInit, OnDestroy {
    private processFilterFeatureFlagService = inject(ProcessFilterFeatureFlagService);

    @ViewChild('apaProcessListCloudExt')
    processListExtCloudComponent: ProcessListCloudExtComponent;
    allowedProcesses = [
        'ADF_CLOUD_PROCESS_FILTERS.RUNNING_PROCESSES',
        'ADF_CLOUD_PROCESS_FILTERS.COMPLETED_PROCESSES',
        'ADF_CLOUD_PROCESS_FILTERS.ALL_PROCESSES',
    ];

    appName: string;
    processFilterProperties: any = {
        filterProperties: [],
        sortProperties: [],
        actions: [],
    };

    processFilter: ProcessFilterCloudModel;
    onDestroy$ = new Subject<void>();

    private readonly store = inject(Store);
    enableNotifications = false;
    showRefreshButton = false;

    filtersRedesignFeature = this.processFilterFeatureFlagService.showNewFilters();
    searchApiMethod$: Observable<'GET' | 'POST'> = of('GET');

    filters: Filter[] = [];
    isDefaultFilter = true;
    private readonly processFilterService = inject(ProcessFilterService);
    filtersLoading$ = this.processFilterService.filtersLoading$;
    canListBeRefreshed: boolean;
    constructor(
        private readonly processFilterCloudService: ProcessFilterCloudService,
        private readonly appConfigService: AppConfigService,
        private readonly route: ActivatedRoute,
        private readonly notificationService: NotificationService
    ) {
        this.searchApiMethod$ = this.processFilterFeatureFlagService.showNewFilters().pipe(
            map((showNewFilters) => {
                const isApa = this.appConfigService.get('application.key') === 'apa';
                if (isApa) {
                    return 'POST';
                }

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
        this.enableNotifications = this.appConfigService.get('notifications', true);
        this.setupFilterProperties();

        this.route.queryParams
            .pipe(
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([params, appName]) => {
                    this.appName = appName;
                    return combineLatest([this.loadFilter(appName, params), this.waitUntilProcessDefinitionsAreLoaded()]);
                }),
                tap(([processFilter]) => {
                    this.setProcessFilter(processFilter);
                    this.isRefreshButtonEnabled();
                    this.resetCurrentFilterRefreshStatus();
                }),
                switchMap(() => {
                    return this.processFilterService.getFilters(this.processFilter);
                }),
                takeUntil(this.onDestroy$)
            )
            .subscribe((filters) => {
                this.filters = filters;
                this.isDefaultFilter = this.processFilterService.isDefaultFilter(this.processFilter);
            });
    }

    ngOnDestroy() {
        this.resetCurrentFilterRefreshStatus();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onProcessFilterAction(action: ProcessFilterAction) {
        switch (action.actionType) {
            case PROCESS_FILTER_ACTION_DELETE: {
                this.getFirstProcessFilter(this.appName)
                    .pipe(take(1), takeUntil(this.onDestroy$))
                    .subscribe((firstFilter: ProcessFilterCloudModel) => {
                        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_DELETED');
                        this.navigateToProcessFilter(firstFilter.id);
                    });
                break;
            }
            case PROCESS_FILTER_ACTION_SAVE:
            case PROCESS_FILTER_ACTION_SAVE_AS: {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
                this.navigateToProcessFilter(action.filter.id);
                break;
            }
            default: {
                break;
            }
        }
    }

    onFilterSave() {
        this.processFilterService
            .saveFilter(this.processFilter)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
                this.navigateToProcessFilter(this.processFilter.id);
            });
    }

    onFilterSaveAs(newFilterName: string) {
        this.processFilterService
            .saveFilterAs(this.processFilter, newFilterName)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
                this.navigateToProcessFilter(this.processFilter.id);
            });
    }

    onFilterDelete() {
        this.processFilterService
            .deleteFilter(this.processFilter)
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe((appProcessFilters) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_DELETED');
                this.navigateToProcessFilter(appProcessFilters[0].id);
            });
    }

    onFilterChange(processFilter: ProcessFilterCloudModel) {
        if (this.processListExtCloudComponent) {
            this.processListExtCloudComponent.fetchCloudPaginationPreference();
        }
        if (processFilter && this.isFilterChanged(this.processFilter, processFilter)) {
            const processCloudFilter = new ProcessCloudFilterAdapter(processFilter);
            const queryParams = {
                ...this.processFilterCloudService.writeQueryParams(
                    processCloudFilter,
                    Object.keys(processCloudFilter),
                    this.appName,
                    processFilter.id
                ),
                filterId: processFilter.id,
            };

            this.store.dispatch(
                navigateToFilter({
                    filterId: processFilter.id,
                    queryParams,
                })
            );
        }
    }

    onFiltersChange(filters: Filter[]) {
        this.processListExtCloudComponent?.fetchCloudPaginationPreference();

        const processFilter = this.processFilterService.createProcessFilterCloudModel(this.processFilter, filters);

        this.setProcessFilter(processFilter);
    }

    private setProcessFilter(processFilter: ProcessFilterCloudModel) {
        this.processFilter = new ProcessFilterCloudModel(processFilter);
        this.setProcessManagementFilter(processFilter);
    }

    private setupFilterProperties() {
        const properties = this.appConfigService.get<Array<any>>('adf-cloud-process-filter-config');
        if (properties) {
            this.processFilterProperties = properties;
        }
    }

    private isFilterChanged(oldValue: ProcessFilterCloudModel, newValue: ProcessFilterCloudModel): boolean {
        const oldKeys = Object.keys(new ProcessCloudFilterAdapter(oldValue));
        const newKeys = Object.keys(new ProcessCloudFilterAdapter(newValue));

        if (oldKeys.length !== newKeys.length) {
            return true;
        }

        for (const key of oldKeys) {
            if (oldValue[key] !== newValue[key]) {
                return true;
            }
        }

        return false;
    }

    private showFilterNotification(key: string) {
        this.notificationService.showInfo(key);
    }

    private navigateToProcessFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId,
            })
        );
    }

    private setProcessManagementFilter(processFilter: ProcessFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter: processFilter,
                },
            })
        );
    }

    private loadFilter(appName: string, params: Params): Observable<ProcessFilterCloudModel> {
        const numberOfParams = Object.keys(params).length;
        const filterId = params['filterId'] || params['id'];

        if (numberOfParams === 0) {
            return this.getFirstProcessFilter(appName);
        } else if (numberOfParams === 1 && filterId) {
            return this.processFilterCloudService.getFilterById(appName, filterId);
        } else {
            return this.getAllProcessesFilter(appName).pipe(
                map((allProcessesModel) => {
                    return new ProcessFilterCloudModel({
                        ...allProcessesModel,
                        ...params,
                        appName,
                    });
                })
            );
        }
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter((areDefinitionsLoaded) => areDefinitionsLoaded));
    }

    onRefreshButtonClicked(): void {
        if (this.canListBeRefreshed) {
            this.refreshProcessList();
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        }
    }

    private refreshProcessList(): void {
        this.processListExtCloudComponent.reload();
        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        this.resetCurrentFilterRefreshStatus();
        this.setRefreshedFilter();
    }

    private resetCurrentFilterRefreshStatus(): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: this.processFilter.key, canBeRefreshed: false }));
    }

    private isRefreshButtonEnabled(): void {
        const isCurrentFilterAllowed = this.allowedProcesses.includes(this.processFilter.name);
        this.showRefreshButton = this.enableNotifications && isCurrentFilterAllowed;
    }

    private setRefreshedFilter(): void {
        this.processFilterCloudService.refreshFilter(this.processFilter.key);
    }

    private getFirstProcessFilter(appName: string): Observable<ProcessFilterCloudModel> {
        return this.processFilterCloudService.getProcessFilters(appName).pipe(map((filters) => filters[0]));
    }

    private getAllProcessesFilter(appName: string): Observable<ProcessFilterCloudModel> {
        return this.processFilterCloudService.getProcessFilters(appName).pipe(map((filters) => filters.find((f) => f.key === 'all-processes')));
    }
}
