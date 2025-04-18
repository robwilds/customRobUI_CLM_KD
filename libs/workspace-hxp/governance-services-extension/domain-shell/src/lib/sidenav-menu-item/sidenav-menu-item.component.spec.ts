/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovernanceSidenavMenuItemComponent } from './sidenav-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeaturesDirective, FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { MockProvider } from 'ng-mocks';
import { AppConfigService, NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';

const EXPECTED_VIOLATIONS: Array<{ [violationId: string]: number }> | undefined = [];

describe('GovernanceSidenavMenuItemComponent', () => {
    let component: GovernanceSidenavMenuItemComponent;
    let fixture: ComponentFixture<GovernanceSidenavMenuItemComponent>;

    const buttonFilter = () => ({
        fixture,
        buttonFilters: { selector: '.hxp-governance-search-menu-item_button' },
    });

    const configureTestingModule = (isFeatureFlagAvailable: boolean) => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FeaturesDirective,
                NoopTranslateModule,
                MatIconModule,
                MatIconTestingModule,
                MatButtonModule,
                RouterTestingModule.withRoutes([{ path: 'governance', component: GovernanceSidenavMenuItemComponent }]),
                GovernanceSidenavMenuItemComponent,
            ],
            providers: [
                SidenavExpansionService,
                MockProvider(AppConfigService),
                { provide: FeaturesServiceToken, useValue: { isOn$: () => of(isFeatureFlagAvailable) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GovernanceSidenavMenuItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    describe('With feature flag on', () => {
        beforeEach(() => {
            configureTestingModule(true);
        });

        it('should display the sidenav menu item component', async () => {
            expect(component).toBeTruthy();
            const hasButton = await ButtonHarnessUtils.hasButton(buttonFilter());
            expect(hasButton).toBeTruthy();
        });

        it('should navigate to governance search page when button is clicked', async () => {
            expect(component).toBeTruthy();
            spyOn(component, 'navigateToSearch');

            await ButtonHarnessUtils.clickButton(buttonFilter());
            expect(component.navigateToSearch).toHaveBeenCalled();
        });

        it('should display collapsed button if state is not expanded', async () => {
            component.data = {
                state: 'collapsed',
            };
            fixture.detectChanges();

            const button = await ButtonHarnessUtils.getButton(buttonFilter());

            expect(button).toBeTruthy();
            expect(await (await button.host()).hasClass('hxp-governance-search-menu-item_button_collapsed')).toBeTruthy();
        });

        it('should pass accessibility checks', async () => {
            const res = await a11yReport('.hxp-governance-search-menu-item_button');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });
    });

    describe('With feature flag off', () => {
        beforeEach(() => {
            configureTestingModule(false);
        });

        it('should not display the sidenav menu item component when feature flag is off', async () => {
            const hasButton = await ButtonHarnessUtils.hasButton(buttonFilter());
            expect(hasButton).toBeFalsy();
        });
    });
});
