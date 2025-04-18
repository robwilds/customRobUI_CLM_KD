/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { ENVIRONMENT_SERVICE_TOKEN } from '../../services/environment.provider';
import { EnvironmentService, FeatureDescription } from '../../services/environment.service';
import { NgFor } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'adf-environment-info',
    templateUrl: './environment-info.component.html',
    styleUrls: ['./environment-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIconModule, MatExpansionModule, NgFor]
})
export class EnvironmentInfoComponent<T> implements OnInit {
    public features: (FeatureDescription & {active: boolean})[];

    constructor(@Inject(ENVIRONMENT_SERVICE_TOKEN) private environmentService: EnvironmentService<T>) {}

    ngOnInit(): void {
        this.features = this.environmentService.describeFeatures();
    }
}
