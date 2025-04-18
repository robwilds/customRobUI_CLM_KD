/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel } from '@alfresco/adf-process-services-cloud';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { PROCESS_ROUTE, TASKS_ROUTE } from '../../constants/extensions.const';
import { selectApplicationName, selectProcessManagementFilter } from '../../store/process-service-cloud.selectors';
import { TranslateModule } from '@ngx-translate/core';
import { SidenavTaskListComponent } from '../sidenav-task-list/sidenav-task-list.component';
import { SidenavProcessListComponent } from '../sidenav-process-list/sidenav-process-list.component';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@alfresco/adf-core';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    standalone: true,
    imports: [
        TranslateModule,
        SidenavTaskListComponent,
        SidenavProcessListComponent,
        MatButtonModule,
        IconComponent,
        MatMenuModule,
        NgIf,
        MatExpansionModule,
    ],
    templateUrl: './sidenav-process-management.component.html',
    styleUrls: ['./sidenav-process-management.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SidenavProcessManagementComponent implements OnInit, OnDestroy {
    @Input() data: any;

    currentFilter: FilterParamsModel = {};
    appName?: string;
    isProcessRouteActive = false;
    isTasksRouteActive = false;

    private readonly onDestroy$ = new Subject<void>();

    constructor(private readonly store: Store<any>, private router: Router) {}

    ngOnInit(): void {
        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntil(this.onDestroy$)
            )
            .subscribe((url) => {
                this.isProcessRouteActive = !!url?.includes(PROCESS_ROUTE);
                this.isTasksRouteActive = !!url?.includes(TASKS_ROUTE);
            });

        this.store
            .select(selectProcessManagementFilter)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((currentFilter) => {
                this.currentFilter = { ...currentFilter };
            });

        this.store
            .select(selectApplicationName)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((appName) => {
                this.appName = appName;
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
