/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ExtensionConfig, ExtensionService, NavBarGroupRef, NavBarLinkRef } from '@alfresco/adf-extensions';
import { Observable, Subject } from 'rxjs';
import { SidenavExtensionService } from '../extensions/sidenav.extension.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    standalone: false,
    selector: 'hxp-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-sidenav' },
})
export class SidenavComponent implements OnInit {
    @Input()
    data: { mode?: 'collapsed' | 'expanded' } = { mode: 'expanded' };

    navbarMenuItemGroups$: Observable<NavBarGroupRef[]>;

    private onDestroySubject$ = new Subject<void>();

    constructor(private sidenavExtensionService: SidenavExtensionService, private extensionService: ExtensionService) {}

    ngOnInit() {
        this.extensionService.setup$.pipe(takeUntil(this.onDestroySubject$)).subscribe((config: ExtensionConfig) => {
            this.sidenavExtensionService.loadSidenavItems(config.features?.navbar ?? []);
            this.navbarMenuItemGroups$ = this.sidenavExtensionService.sidenavGroups$;
        });
    }

    trackByGroupId(_: number, obj: NavBarGroupRef): string {
        return obj.id;
    }

    trackByLinkId(_: number, obj: NavBarLinkRef): string {
        return obj.id;
    }
}
