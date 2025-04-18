/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector, State } from '@ngrx/store';
import { featureKey } from '../reducers/reducer';
import { CustomModeledExtensionMainState } from '../states/state';

export const selectFeature = (state: State<CustomModeledExtensionMainState>) => state[featureKey];

export const selectApplicationName = createSelector(selectFeature, (state) => state.extension.application);
