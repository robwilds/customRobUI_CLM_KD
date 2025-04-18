/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, HeaderLayoutComponent, SidenavLayoutComponent } from '@alfresco/adf-core';
import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { UserInfoComponent } from '@alfresco-dbp/shared/user-info';
import { ToolbarMoreMenuComponent } from '../toolbar/more-menu/toolbar-more-menu.component';

interface HxpHeaderConfig {
    headerColor: string;
    headerTextColor: string;
    application: {
        name: string;
        logo: string;
        headerImagePath: string;
    };
    features?: {
        header?: ContentActionRef[];
    };
}

@Component({
    selector: 'hxp-workspace-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, MatDividerModule, AsyncPipe, TranslateModule, HeaderLayoutComponent, UserInfoComponent, ToolbarMoreMenuComponent],
})
export class HxpWorkspaceHeaderComponent {
    @Input() data: { layout?: SidenavLayoutComponent; isMenuMinimized?: boolean } = {};
    @Input() showSidenavToggle = true;
    @Input() expandedSidenav = true;

    headerTextColor$: Observable<string>;
    backgroundColor$: Observable<any>;
    backgroundImage$: Observable<string>;
    title$: Observable<string>;
    logoPath$: Observable<string>;
    landingPage: string;

    constructor(private extensionService: ExtensionService, private appConfigService: AppConfigService) {
        const config$ = this.extensionService.setup$.pipe(switchMap(() => of<HxpHeaderConfig>(this.appConfigService.config)));

        config$
            .pipe(
                take(1),
                filter((config) => !!config.headerTextColor),
                map((config) => config.headerTextColor)
            )
            .subscribe((headerTextColor) => {
                document.documentElement.style.setProperty('--adf-header-text-color', headerTextColor);
            });

        this.backgroundColor$ = config$.pipe(map<HxpHeaderConfig, string>((config) => config.headerColor));

        this.headerTextColor$ = config$.pipe(map<HxpHeaderConfig, string>((config) => config.headerTextColor));

        this.title$ = config$.pipe(map<HxpHeaderConfig, string>((config) => config.application.name));

        this.logoPath$ = config$.pipe(map<HxpHeaderConfig, string>((config) => config.application.logo));

        this.backgroundImage$ = config$.pipe(map<HxpHeaderConfig, string>((config) => config.application.headerImagePath || ''));

        this.landingPage = this.appConfigService.get('landingPage', '');
    }

    toggleMenu(): void {
        this.data.layout?.toggleMenu();
    }
}
