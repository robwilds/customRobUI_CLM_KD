/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action } from '@ngrx/store';
import { ModelTemplatesState, INITIAL_MODEL_TEMPLATE_EDITOR_STATE, adapter } from './model-templates.state';
import { GET_MODEL_TEMPLATES_SUCCESS, GetModelTemplatesSuccessAction } from './model-templates.actions';
import { ModelTemplateState } from '../model/model-templates.model';

export function modelTemplateReducer(state: ModelTemplatesState = { ...INITIAL_MODEL_TEMPLATE_EDITOR_STATE }, action: Action): ModelTemplatesState {
    let newState: ModelTemplatesState;

    switch (action.type) {
        case GET_MODEL_TEMPLATES_SUCCESS: {
            return getModelTemplatesSuccess(state, <GetModelTemplatesSuccessAction>action);
        }

        default: {
            newState = { ...state };
        }
    }

    return newState;
}

function getModelTemplatesSuccess(state: ModelTemplatesState, action: GetModelTemplatesSuccessAction): ModelTemplatesState {
    const updateState = { ...state.updateState };
    updateState[action.modelType] = ModelTemplateState.SAVED;

    return adapter.addMany(action.modelTemplates, {
        ...state,
        updateState,
    });
}
