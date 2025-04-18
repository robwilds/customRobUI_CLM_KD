/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { ExtensionLoaderCallback } from '@alfresco/aca-shared';

import { CustomModeledExtensionExtensionService } from './custom-modeled-extension.service';
import { initialiseExtension } from '../store/actions/extension.actions';
import { AppConfigService } from '@alfresco/adf-core';

export function customModeledExtensionPluginLoaderFactory(
    customModeledExtensionExtensionService: CustomModeledExtensionExtensionService,
    appConfigService: AppConfigService,
    store: Store<any>
): ExtensionLoaderCallback {
    return () =>
        customModeledExtensionExtensionService.checkBackendHealth().pipe(
            tap((health) => {
                store.dispatch(
                    initialiseExtension({
                        health,
                        application: appConfigService.get('alfresco-deployed-apps')[0].name,
                    })
                );
            })
        );
}
