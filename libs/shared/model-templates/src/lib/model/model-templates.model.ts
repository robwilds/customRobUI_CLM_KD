/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken, Type } from '@angular/core';
import { ModelTemplatesProvider } from '../services/provider/model-templates-provider.service';

export enum ModelTemplateState {
    INITIAL = 'initial',
    SAVED = 'saved',
}

export enum ModelsWithTemplates {
    CONNECTOR = 'CONNECTOR',
    RENDITION = 'RENDITION',
    FILE = 'FILE',
    SECURITY_POLICY = 'SECURITY_POLICY',
    SCREEN = 'SCREEN',
}

export interface ModelTemplateResponse {
    entry: ModelTemplate;
}

export interface ModelTemplatesResponse {
    list: {
        entries: ModelTemplateResponse[];
    };
}

export type ModelTemplateContent = Record<string, any>;

export interface ModelTemplate {
    id: number;
    name: string;
    modelType: string;
    description?: string;
    description_key?: string;
    content: ModelTemplateContent;
}

export const MODEL_TEMPLATES_PROVIDER = new InjectionToken<ModelTemplatesProvider>('model-templates-provider');

export function provideModelTemplates(provider: Type<ModelTemplatesProvider>) {
    return {
        provide: MODEL_TEMPLATES_PROVIDER,
        useClass: provider,
    };
}
