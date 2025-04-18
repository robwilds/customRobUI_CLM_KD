/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, combineReducers } from '@ngrx/store';
import { CustomModeledExtensionMainState, initialCustomModeledExtensionState } from '../states/state';
import { customModeledExtensionExtensionReducer } from './extension.reducer';

export const featureKey = 'customModeledExtension';

export const mainReducer = combineReducers(
    {
        extension: customModeledExtensionExtensionReducer,
    },
    initialCustomModeledExtensionState
);

export function reducer(state: CustomModeledExtensionMainState | undefined, action: Action) {
    return mainReducer(state, action);
}
