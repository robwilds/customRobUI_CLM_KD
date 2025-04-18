/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { initialiseExtension } from '../actions/extension.actions';
import { initialCustomModeledExtensionState } from '../states/state';
import { reducer } from './reducer';

describe('CustomModeledExtensionReducer', () => {
    it('should handle initialiseExtension', () => {
        const initialState = { ...initialCustomModeledExtensionState };
        const newState = reducer(initialState, initialiseExtension({ health: true, application: 'mockApp' }));
        expect(newState.extension).toEqual({ health: true, application: 'mockApp' });
    });
});
