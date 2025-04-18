/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ModelTemplate, ModelTemplateState, ModelsWithTemplates } from '../model/model-templates.model';

export interface ModelTemplatesState extends EntityState<ModelTemplate> {
    updateState: { [key in ModelsWithTemplates]: ModelTemplateState };
}

export const adapter = createEntityAdapter<ModelTemplate>();

export const INITIAL_MODEL_TEMPLATE_EDITOR_STATE: ModelTemplatesState = {
    ...adapter.getInitialState(),
    updateState: {
        CONNECTOR: ModelTemplateState.INITIAL,
        RENDITION: ModelTemplateState.INITIAL,
        FILE: ModelTemplateState.INITIAL,
        SECURITY_POLICY: ModelTemplateState.INITIAL,
        SCREEN: ModelTemplateState.INITIAL,
    },
};
