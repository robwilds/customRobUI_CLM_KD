/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { IdentityUserService, UserPreferenceCloudService } from '@alfresco/adf-process-services-cloud';
import { SavedSearchesPreferencesApiService } from '@alfresco/adf-content-services';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectApplicationName } from '../store/selectors/extension.selectors';
import { PreferenceEntry } from '@alfresco/js-api';

@Injectable({
    providedIn: 'root',
})
export class SavedSearchesPreferencesService implements SavedSearchesPreferencesApiService {
    private cloudPreferencesService = inject(UserPreferenceCloudService);
    private store = inject(Store);
    private identityUserService = inject(IdentityUserService);

    getPreference(_: string, key: string): Observable<PreferenceEntry> {
        return this.store.select(selectApplicationName).pipe(
            take(1),
            switchMap((appName) => {
                const userKey = this.getPreferencesKey(key);
                return this.cloudPreferencesService.getPreferenceByKey(appName, userKey);
            }),
            map((preferences) => {
                return {
                    entry: {
                        id: key,
                        value: preferences,
                    },
                };
            })
        );
    }

    updatePreference(_: string, key: string, data: string): Observable<any> {
        return this.store.select(selectApplicationName).pipe(
            take(1),
            switchMap((appName) => {
                const userKey = this.getPreferencesKey(key);
                return this.cloudPreferencesService.updatePreference(appName, userKey, data);
            }),
            map((preferences) => {
                return {
                    entry: {
                        id: key,
                        value: preferences,
                    },
                };
            })
        );
    }

    private getPreferencesKey(key: string): string {
        const userInfo = this.identityUserService.getCurrentUserInfo();
        return `${key}-${userInfo.username}`;
    }
}
