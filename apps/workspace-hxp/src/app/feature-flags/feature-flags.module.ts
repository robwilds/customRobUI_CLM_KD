/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, NgModule, Optional } from '@angular/core';
import { environment } from '../../environments/environment';
import { provideDummyFeatureFlags, provideDebugFeatureFlags, FlagsOverrideComponent, FlagsOverrideToken } from '@alfresco/adf-core/feature-flags';
import { provideFeaturesFlags } from '@features';
import { ExtensionService } from '@alfresco/adf-extensions';
import { FeatureFlagsMenuItemComponent } from './feature-flag-menu-item.component';
import { provideTranslations } from '@alfresco/adf-core';

@NgModule({
    imports: [FlagsOverrideComponent],
    providers: [
        provideTranslations('feature-flags', 'assets/feature-flags'),
        ...provideDummyFeatureFlags(), // It is supposed to be provided by ADF by default, but every app should reprovide it. See the line below.
        ...provideFeaturesFlags({ isApplicationAware: true, serviceRelativePath: '/rb' }),

        // Provided in _NOT_ release configuration
        ...(environment.devTools
            ? provideDebugFeatureFlags({
                  storageKey: 'hxw-feature-flags',
              })
            : []),
    ],
})
export class FeatureFlagsModule {
    constructor(extensions: ExtensionService, @Optional() @Inject(FlagsOverrideToken) public flagsOverride = false) {
        extensions.setComponents({
            'feature-flags.menu-button': FeatureFlagsMenuItemComponent,
        });

        extensions.setEvaluators({
            'feature-flags.isEnabled': () => flagsOverride,
        });
    }
}
