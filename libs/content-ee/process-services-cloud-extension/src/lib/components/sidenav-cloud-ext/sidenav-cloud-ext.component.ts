/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProcessManagementFilter } from '../../store/selectors/extension.selectors';
import { FilterParamsModel } from '@alfresco/adf-process-services-cloud';
import { TranslateModule } from '@ngx-translate/core';
import { TaskFiltersCloudExtComponent } from '../../features/task-list/components/task-filters-ext/task-filters-cloud-ext.component';
import { IconComponent } from '@alfresco/adf-core';
import { ProcessFiltersCloudExtComponent } from '../../features/process-list/components/process-filters/process-filters-cloud-ext.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    standalone: true,
    imports: [
        TranslateModule,
        TaskFiltersCloudExtComponent,
        IconComponent,
        ProcessFiltersCloudExtComponent,
        MatButtonModule,
        MatMenuModule,
        AsyncPipe,
        MatExpansionModule,
        NgIf,
    ],
    templateUrl: './sidenav-cloud-ext.component.html',
    styleUrls: ['./sidenav-cloud-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SidenavCloudExtComponent implements OnInit {
    @Input() data;
    currentFilter$: Observable<FilterParamsModel>;

    constructor(private store: Store<any>) {}

    ngOnInit() {
        this.currentFilter$ = this.store.select(selectProcessManagementFilter);
    }

    isExpanded(): boolean {
        return this.data.state === 'expanded';
    }
}
