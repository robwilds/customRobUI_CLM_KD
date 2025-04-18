/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { LanguageMenuComponent } from '@alfresco/adf-core';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, HostListener, Inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { STUDIO_SHARED } from '@features';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    standalone: true,
    selector: 'hxp-language-menu',
    template: `
        <button *ngIf="canShowLanguageMenu | async" mat-menu-item [matMenuTriggerFor]="langMenu" data-automation-id="hxp-user-language-menu">
            <mat-icon>language</mat-icon>
            <span>{{ 'APP.HEADER.LANGUAGE' | translate }}</span>
        </button>

        <mat-menu #langMenu="matMenu">
            <adf-language-menu></adf-language-menu>
        </mat-menu>
    `,
    imports: [NgIf, AsyncPipe, TranslateModule, MatIconModule, MatMenuModule, LanguageMenuComponent],
})
export class HxpLanguageMenuComponent {
    canShowLanguageMenu: Observable<boolean>;

    @ViewChild(MatMenuTrigger)
    private readonly trigger: MatMenuTrigger | undefined;

    constructor(@Inject(FeaturesServiceToken) private readonly featuresService: IFeaturesService) {
        this.canShowLanguageMenu = this.featuresService.isOn$(STUDIO_SHARED.ENABLE_LOCALISATION).pipe(map((isEnabled) => !!isEnabled));
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.trigger?.openMenu();
    }
}
