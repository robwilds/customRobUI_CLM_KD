/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ShellLayoutComponent } from '@alfresco/adf-core/shell';
import { Routes } from '@angular/router';
import { ExtensionsDataLoaderGuard } from './extensions/extensions-data-loader.guard';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '@alfresco/adf-core';
import { FeatureFlagsWrapperComponent, IsFlagsOverrideOn } from '@alfresco/adf-core/feature-flags';

export const APP_ROUTES: Routes = [
    {
        path: 'flags',
        component: FeatureFlagsWrapperComponent,
        canMatch: [IsFlagsOverrideOn],
    },
    {
        path: '',
        component: ShellLayoutComponent,
        canActivate: [ExtensionsDataLoaderGuard],
        children: [
            {
                path: '',
                canActivate: [AuthGuard],
                component: HomeComponent,
                pathMatch: 'full',
            },
        ],
    },
];
