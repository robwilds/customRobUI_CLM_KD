/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter, FilterService } from '@alfresco-dbp/shared-filters-services';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { take, takeUntil } from 'rxjs/operators';
import { FilterByPipe } from './filter-by.pipe';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-more-filters-menu',
    templateUrl: './more-filters-menu.component.html',
    styleUrls: ['./more-filters-menu.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        TranslateModule,
        MatDividerModule,
        FilterByPipe,
        A11yModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoreFiltersMenuComponent implements OnInit, OnDestroy {
    private readonly filterService = inject(FilterService);

    @Output() filtersVisibilityUpdate = new EventEmitter<Filter[]>();

    readonly filters: Filter[] = [];

    filterVisibilitiesForm = new FormGroup({});

    searchInput = new FormControl('');

    private readonly onDestroy$ = new EventEmitter<void>();

    ngOnInit(): void {
        this.filterService
            .getAllFilters()
            .pipe(take(1), takeUntil(this.onDestroy$))
            .subscribe((filters) => {
                filters.forEach((filter) => {
                    this.filters.push(filter);
                    this.filterVisibilitiesForm.addControl(filter.name, new FormControl(false));
                    this.filterVisibilitiesForm.get(filter.name)?.setValue(filter.visible);
                });
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.emit();
        this.onDestroy$.complete();
    }

    onUpdate(): void {
        this.filters.forEach((filter) => {
            const newVisibility = this.filterVisibilitiesForm.get(filter.name)?.value;
            if (newVisibility !== filter.visible) {
                filter.visible = newVisibility;
                this.filterService.updateFilter(filter);
            }
        });
        this.filtersVisibilityUpdate.emit(this.filters);
    }

    trackByName(index: number, filter: Filter) {
        return `${filter.name}${filter.description}`;
    }
}
