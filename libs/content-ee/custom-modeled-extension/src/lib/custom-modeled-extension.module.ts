/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppConfigService, provideTranslations } from '@alfresco/adf-core';
import { ExtensionService, ExtensionRef, mergeObjects, ExtensionConfig } from '@alfresco/adf-extensions';
import { EXTENSION_DATA_LOADERS } from '@alfresco/aca-shared';
import { CustomModeledExtensionExtensionService } from './services/custom-modeled-extension.service';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { FormActionDialogComponent } from './components/form-action-dialog/form-action-dialog.component';
import { customModeledExtensionPluginLoaderFactory } from './services/custom-modeled-extension-loader.factory';
import {
    currentFolderHasAspect,
    currentFolderHasPropertyWithValue,
    currentFolderIsOfType,
    currentFolderName,
    fileNames,
    filesAreOfType,
    filesHaveAspect,
    filesHavePropertyWithValue,
    folderHavePropertyWithValue,
    folderNames,
    foldersAreOfType,
    foldersHaveAspect,
} from './rules/custom-modeled-extension.rules';
import { filter, take } from 'rxjs/operators';
import { EffectsModule } from '@ngrx/effects';
import { CustomModeledExtensionEffects } from './store/effects/custom-modeled-extension.effects';
import * as customModeledExtensionServices from './store/reducers/reducer';
import { SAVED_SEARCHES_SERVICE_PREFERENCES } from '@alfresco/adf-content-services';
import { SavedSearchesPreferencesService } from './services/saved-searches-preferences.service';

@NgModule({
    imports: [
        EffectsModule.forFeature([CustomModeledExtensionEffects]),
        StoreModule.forFeature(customModeledExtensionServices.featureKey, customModeledExtensionServices.reducer),
        ProcessServicesCloudModule.forRoot(),
        FormActionDialogComponent,
    ],
    providers: [
        {
            provide: SAVED_SEARCHES_SERVICE_PREFERENCES,
            useClass: SavedSearchesPreferencesService,
        },
        provideTranslations('custom-modeled-extension', 'assets/custom-modeled-extension'),
        {
            provide: EXTENSION_DATA_LOADERS,
            multi: true,
            useFactory: customModeledExtensionPluginLoaderFactory,
            deps: [CustomModeledExtensionExtensionService, AppConfigService, Store],
        },
    ],
})
export class CustomModeledExtensionExtensionModule {
    constructor(
        private extensions: ExtensionService,
        private appConfigService: AppConfigService,
        customModeledExtensionExtensionService: CustomModeledExtensionExtensionService
    ) {
        this.extensions.setEvaluators({
            'selection.files.type': filesAreOfType,
            'selection.folders.type': foldersAreOfType,
            'selection.currentFolder.type': currentFolderIsOfType,
            'selection.files.aspect': filesHaveAspect,
            'selection.folders.aspect': foldersHaveAspect,
            'selection.currentFolder.aspect': currentFolderHasAspect,
            'selection.files.name': fileNames,
            'selection.folders.name': folderNames,
            'selection.currentFolder.name': currentFolderName,
            'selection.files.property': filesHavePropertyWithValue,
            'selection.folders.property': folderHavePropertyWithValue,
            'selection.currentFolder.property': currentFolderHasPropertyWithValue,

            'custom-modeled-extension.backend.isRunning': isProcessServiceCloudRunning,
        });

        this.appConfigService
            .select('custom-modeled-extension')
            .pipe(
                filter((customModeledExtension) => !!customModeledExtension?.$id),
                take(1)
            )
            .subscribe((customModeledExtension: ExtensionRef) => {
                this.extensions.setup$.pipe(filter((config) => !!config)).subscribe((config) => {
                    if (!config?.$references?.find((reference) => reference['$id'] === customModeledExtension.$id)) {
                        this.initializeExtension(config, customModeledExtension);
                    }
                });
            });

        function isProcessServiceCloudRunning(): boolean {
            return customModeledExtensionExtensionService.runtimeBundleServicesCloudRunning;
        }
    }

    private initializeExtension(config: ExtensionConfig, customModeledExtension: ExtensionRef) {
        config.features = config.features ? mergeObjects(config.features, customModeledExtension.features) : customModeledExtension.features;
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
