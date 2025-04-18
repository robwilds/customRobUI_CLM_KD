/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { IFeaturesService, FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { inject, Injectable } from '@angular/core';
import { STUDIO_SHARED } from '@features';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProcessFilterFeatureFlagService {
    private appConfigService = inject(AppConfigService);
    private featuresService = inject<IFeaturesService>(FeaturesServiceToken);

    showNewFilters(): Observable<boolean> {
        const applicationKey: string = this.appConfigService.get('application.key', '');
        const areNewFiltersEnabled: boolean = this.appConfigService.get('enableNewFilters', false);

        return applicationKey === 'hxps-runtime' ? this.featuresService.isOn$(STUDIO_SHARED.STUDIO_FILTERS_REDESIGN) : of(areNewFiltersEnabled);
    }
}
