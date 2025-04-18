/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelTemplatesState } from '../+state/model-templates.state';
import { ModelTemplate, ModelTemplateState } from '../model/model-templates.model';

export const mockConnectorModelTemplate1: ModelTemplate = {
    id: 1,
    name: 'mockConnector1',
    modelType: 'CONNECTOR',
    description: 'mock connector model template 1',
    content: {
        template: 'mockConnector1',
    },
};

export const mockConnectorModelTemplate2: ModelTemplate = {
    id: 2,
    name: 'mockConnector2',
    modelType: 'CONNECTOR',
    description: 'mock connector model template 2',
    content: {
        template: 'mockConnector2',
    },
};

export const mockConnectorModelTemplate3: ModelTemplate = {
    id: 3,
    name: 'mockConnector3',
    modelType: 'CONNECTOR',
    description: 'mock connector model template 3',
    content: {
        template: 'mockConnector3',
    },
};

export const mockRenditionModelTemplate1: ModelTemplate = {
    id: 4,
    name: 'mockRendition1',
    modelType: 'RENDITION',
    description: 'mock rendition model template 1',
    content: {
        template: 'mockRendition1',
    },
};

export const mockRenditionModelTemplate2: ModelTemplate = {
    id: 5,
    name: 'mockRendition2',
    modelType: 'RENDITION',
    description: 'mock rendition model template 2',
    content: {
        template: 'mockRendition2',
    },
};

export const modelTemplatesState: ModelTemplatesState = {
    entities: {
        1: mockConnectorModelTemplate1,
        2: mockConnectorModelTemplate2,
        3: mockConnectorModelTemplate3,
        4: mockRenditionModelTemplate1,
        5: mockRenditionModelTemplate2,
    },
    ids: [1, 2, 3, 4, 5, 6],
    updateState: {
        CONNECTOR: ModelTemplateState.SAVED,
        RENDITION: ModelTemplateState.INITIAL,
    },
} as any;
