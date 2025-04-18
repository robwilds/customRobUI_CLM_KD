/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentInfoComponent } from './components/environment-info/environment-info.component';
import { FeatureDirective } from './directives/feature/feature.directive';
import { Environment, EnvironmentService, FeaturesInfo } from './services/environment.service';
import { createEnvironmentServices, ENVIRONMENT_SERVICE_TOKEN } from './services/environment.provider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    imports: [CommonModule, MatIconModule, MatExpansionModule, EnvironmentInfoComponent, FeatureDirective],
    exports: [EnvironmentInfoComponent, FeatureDirective]
})
export class EnvironmentModule {
    public static forRoot<T = any>(
        config: Environment<T>,
        featuresInfo: FeaturesInfo<T>,
        providerToken?: InjectionToken<EnvironmentService<T>>
    ): ModuleWithProviders<EnvironmentModule> {
        return {
            ngModule: EnvironmentModule,
            providers: [
                {
                    provide: ENVIRONMENT_SERVICE_TOKEN,
                    useFactory: createEnvironmentServices.bind(null, config, featuresInfo)
                },
                ...(providerToken ? [{ provide: providerToken, useExisting: ENVIRONMENT_SERVICE_TOKEN }] : [])
            ]
        };
    }
}
