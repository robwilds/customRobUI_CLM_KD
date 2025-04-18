/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnInit } from '@angular/core';
import { UserAppsService } from '../../services/user-apps-list.service';
import { UserApps } from '../../interfaces/apps.interface';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderMenuComponent } from '../header-menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'hxp-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [CommonModule, RouterModule, TranslateModule, MatMenuModule, MatToolbarModule, MatDividerModule, HeaderMenuComponent],
})
export class HxpHeaderComponent implements OnInit {
    @Input()
    data: Record<string, unknown> = {};

    userApps$: Observable<UserApps[]> = EMPTY;

    constructor(private readonly userAppsService: UserAppsService) {}

    ngOnInit(): void {
        this.userApps$ = this.userAppsService.getUserAppsData();
    }
}
