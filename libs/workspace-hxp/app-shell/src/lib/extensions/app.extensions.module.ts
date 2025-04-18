/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { ExtensionConfig, ExtensionRef, ExtensionService, mergeObjects } from '@alfresco/adf-extensions';
import { AppExtensionService } from './app.extension.service';
import { ProcessServicesCloudExtensionDomainShellModule } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/domain-shell';
import { AppConfigService } from '@alfresco/adf-core';
import { filter, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AnalyticsModule } from '@alfresco-dbp/shared/analytics';

export function setupExtensions(service: AppExtensionService): () => void {
    return () => service.load();
}

@NgModule({
    imports: [ProcessServicesCloudExtensionDomainShellModule, AnalyticsModule],
})
export class AppExtensionsModule {
    constructor(private extensions: ExtensionService, private appConfigService: AppConfigService, private appExtensionService: AppExtensionService) {
        if (extensions) {
            const customModeledExtension$ = this.appConfigService.select('custom-modeled-extension').pipe(
                filter((customModeledExtension) => !!customModeledExtension?.$id),
                take(1)
            );

            combineLatest([customModeledExtension$, this.extensions.setup$, this.appExtensionService.onLoad$])
                .pipe(take(1))
                .subscribe(([customModeledExtension, extensionConfig]) => {
                    if (!extensionConfig?.$references?.find((reference) => reference['$id'] === customModeledExtension.$id)) {
                        this.initializeExtension(extensionConfig, customModeledExtension);
                    }
                });
        }
    }

    static forRoot(): ModuleWithProviders<AppExtensionsModule> {
        return {
            ngModule: AppExtensionsModule,
            providers: [
                {
                    provide: APP_INITIALIZER,
                    useFactory: setupExtensions,
                    deps: [AppExtensionService],
                    multi: true,
                },
            ],
        };
    }

    static forChild(): ModuleWithProviders<AppExtensionsModule> {
        return {
            ngModule: AppExtensionsModule,
        };
    }

    private initializeExtension(config: ExtensionConfig, customModeledExtension: ExtensionRef) {
        config.features = config.features ? mergeObjects(config.features, customModeledExtension.features || {}) : customModeledExtension.features;
        config.rules = customModeledExtension.rules ? (config.rules || []).concat(customModeledExtension.rules) : config.rules;
        config.actions = customModeledExtension.actions ? (config.actions || []).concat(customModeledExtension.actions) : config.actions;
        config.routes = customModeledExtension.routes ? (config.routes || []).concat(customModeledExtension.routes) : config.routes;
        config.appConfig = config.appConfig ? mergeObjects(config.appConfig, customModeledExtension.appConfig) : customModeledExtension.appConfig;

        config.$references = config.$references || [];
        config.$references.push({
            $id: customModeledExtension.$id,
            $name: customModeledExtension.$name,
            $description: customModeledExtension.$description,
            $vendor: customModeledExtension.$vendor,
            $license: customModeledExtension.$license,
            $version: customModeledExtension.$version,
        });

        this.extensions.setup(config);
    }
}
