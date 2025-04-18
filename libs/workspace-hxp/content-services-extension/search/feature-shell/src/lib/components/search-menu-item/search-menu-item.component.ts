/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { Subject } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';

const SEARCH_ROUTE = '/search';

@Component({
    standalone: false,
    selector: 'hxp-search-menu-item',
    templateUrl: './search-menu-item.component.html',
    styleUrls: ['./search-menu-item.component.scss'],
})
export class SearchMenuItemComponent implements OnDestroy, OnInit {
    @Input()
    data: any;

    protected isSideNavExpanded: boolean;
    protected isSearchRouteActive = false;

    private readonly onDestroy$ = new Subject<void>();

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private zone: NgZone,
        private router: Router,
        private sidenavExpansionService: SidenavExpansionService
    ) {
        this.isSideNavExpanded = this.sidenavExpansionService.isSideNavExpanded();
    }

    ngOnInit(): void {
        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntil(this.onDestroy$)
            )
            .subscribe((url) => {
                this.isSearchRouteActive = !!url?.includes(SEARCH_ROUTE);
                this.cdRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    isExpanded(): boolean {
        return this.data?.state === 'expanded';
    }

    navigateToSearch(): void {
        this.zone.run(() => {
            void this.router.navigate([SEARCH_ROUTE], { queryParams: { type: 'basic', q: '' } });
        });
    }
}
