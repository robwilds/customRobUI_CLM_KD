/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DialogService } from '@alfresco-dbp/shared/dialog';
import { Component, Inject, InjectionToken, Input, Optional, ViewEncapsulation } from '@angular/core';
import { FeaturesServiceToken, FlagsComponent, FlagsOverrideComponent, FlagsOverrideToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserInitialsComponent } from '../user-initials/user-initials.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { InitialUsernamePipe, LogoutDirective } from '@alfresco/adf-core';
import { Observable } from 'rxjs';
import { STUDIO_SHARED } from '@features';
import { map, take } from 'rxjs/operators';
import { HxpLanguageMenuComponent } from '../language-menu/language-menu.component';
import { HXP_DOCUMENTATION_URL } from '@alfresco-dbp/shared-core';

export const HXP_HEADER_MENU_DOCUMENTATION_URL = new InjectionToken<string>(HXP_DOCUMENTATION_URL, {
    factory: () => HXP_DOCUMENTATION_URL,
});

@Component({
    standalone: true,
    selector: 'hxp-header-menu',
    templateUrl: './header-menu.component.html',
    styleUrls: ['./header-menu.component.scss'],
    imports: [
        CommonModule,
        TranslateModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        FlagsOverrideComponent,
        UserInitialsComponent,
        LogoutDirective,
        HxpLanguageMenuComponent,
    ],
    providers: [InitialUsernamePipe, DialogService],
    encapsulation: ViewEncapsulation.None,
})
export class HeaderMenuComponent {
    @Input()
    data: Record<string, unknown> = {};

    canShowLanguageMenu: Observable<boolean>;

    constructor(
        private dialogService: DialogService,
        @Optional() @Inject(FlagsOverrideToken) public flagsOverride = false,
        @Optional() @Inject(HXP_HEADER_MENU_DOCUMENTATION_URL) public docsUrl = HXP_DOCUMENTATION_URL,
        @Inject(FeaturesServiceToken) private readonly featuresService: IFeaturesService
    ) {
        this.canShowLanguageMenu = this.featuresService.isOn$(STUDIO_SHARED.ENABLE_LOCALISATION).pipe(
            take(1),
            map((isEnabled) => !!isEnabled)
        );
    }

    openFeatureFlags() {
        this.dialogService.openDialog(FlagsComponent, { width: '700px', height: '500px', panelClass: 'hxp-override-features-dialog' });
    }
}
