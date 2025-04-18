/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ModelTemplatesState } from './model-templates.state';
import { ModelTemplate, ModelTemplateState, ModelsWithTemplates } from '../model/model-templates.model';

export const MODEL_TEMPLATE_STATE_NAME = 'model-template-state';

const getModelTemplateState = createFeatureSelector<ModelTemplatesState>(MODEL_TEMPLATE_STATE_NAME);

const selectModelTemplatesEntities = createSelector(getModelTemplateState, (state) => state.entities);

const selectModelTemplatesSaving = createSelector(getModelTemplateState, (state) => state.updateState);

export const selectModelTemplatesSavingByModelType = (modelType: ModelsWithTemplates) =>
    createSelector(selectModelTemplatesSaving, (updateState) => updateState[modelType]);

export const selectModelTemplatesByModelType = (modelType: ModelsWithTemplates) =>
    createSelector(selectModelTemplatesEntities, selectModelTemplatesSavingByModelType(modelType), (entities, status) => {
        const modelTemplates: ModelTemplate[] = [];
        if (status === ModelTemplateState.SAVED) {
            Object.values(entities).forEach((entity) => {
                if (!!entity && entity.modelType === modelType) {
                    modelTemplates.push(entity);
                }
            });
        }
        return modelTemplates;
    });
