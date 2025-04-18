/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovernanceServicesExtensionComponent } from './governance-services-extension.component';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

describe('GovernanceExtensionComponent', () => {
    let component: GovernanceServicesExtensionComponent;
    let fixture: ComponentFixture<GovernanceServicesExtensionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GovernanceServicesExtensionComponent],
            providers: [
                provideMockFeatureFlags({
                    'cic-governance-workspace-extension': false,
                }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GovernanceServicesExtensionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
