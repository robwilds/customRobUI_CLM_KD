/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { DocumentService, DocumentRouterService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Subject } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';

const CONTENT_BROWSER_ROUTE = '/documents';

@Component({
    standalone: false,
    selector: 'hxp-sidenav',
    templateUrl: './hxp-sidenav.component.html',
    styleUrls: ['./hxp-sidenav.component.scss'],
})
export class HxpSidenavComponent implements OnDestroy, OnInit {
    @Input()
    data: any;

    protected document: Document | undefined;
    protected isSideNavExpanded: boolean;

    private destroyed$: Subject<void> = new Subject<void>();
    private isContentBrowserRouteActive = false;

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private documentService: DocumentService,
        private router: Router,
        private documentRouterService: DocumentRouterService,
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
                takeUntil(this.destroyed$)
            )
            .subscribe((url) => {
                this.isContentBrowserRouteActive = !!url?.includes(CONTENT_BROWSER_ROUTE);
                if (!this.isContentBrowserRouteActive) {
                    this.document = null;
                }
                this.cdRef.detectChanges();
            });

        this.documentService.documentLoaded$
            .pipe(
                filter((doc) => !!doc),
                takeUntil(this.destroyed$)
            )
            .subscribe((document) => {
                this.document = document;
            });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    isExpanded(): boolean {
        return this.data?.state === 'expanded';
    }

    navigateToRoot(): void {
        this.documentRouterService.navigateTo(ROOT_DOCUMENT);
    }

    navigateToDocument(document: Document): void {
        this.documentRouterService.navigateTo(document);
    }
}
