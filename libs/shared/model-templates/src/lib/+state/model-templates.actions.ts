/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action } from '@ngrx/store';
import { ModelTemplate, ModelsWithTemplates } from '../model/model-templates.model';

export const GET_MODEL_TEMPLATES_SUCCESS = '[ModelTemplates] Get success';
export class GetModelTemplatesSuccessAction implements Action {
    readonly type = GET_MODEL_TEMPLATES_SUCCESS;
    constructor(public modelType: ModelsWithTemplates, public modelTemplates: ModelTemplate[]) {}
}

export type ModelTemplateActions = GetModelTemplatesSuccessAction;
