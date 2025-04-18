/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';

import { ModelTemplatesService } from './model-templates.service';
import {
    mockConnectorModelTemplate1,
    mockConnectorModelTemplate2,
    mockConnectorModelTemplate3,
    mockRenditionModelTemplate1,
    mockRenditionModelTemplate2,
    modelTemplatesState,
} from '../mocks/model-templates.mock';
import { HttpClientModule } from '@angular/common/http';
import { MODEL_TEMPLATES_PROVIDER, ModelTemplate, ModelsWithTemplates } from '../model/model-templates.model';
import { Store, StoreModule } from '@ngrx/store';
import { MODEL_TEMPLATE_STATE_NAME } from '../+state/model-templates.selectors';
import { modelTemplateReducer } from '../+state/model-templates.reducer';
import { GetModelTemplatesSuccessAction } from '../+state/model-templates.actions';
import { of } from 'rxjs';
import { ModelTemplatesProvider } from './model-templates-provider.service';

describe('ModelTemplatesService', () => {
    let service: ModelTemplatesService;
    let modelTemplatesProvider: ModelTemplatesProvider;
    let store: Store<ModelTemplate>;
    let dispatchSpy: jest.SpyInstance;

    const connectorTemplates = [mockConnectorModelTemplate1, mockConnectorModelTemplate2, mockConnectorModelTemplate3];
    const renditionTemplates = [mockRenditionModelTemplate1, mockRenditionModelTemplate2];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                StoreModule.forRoot({}),
                StoreModule.forFeature(MODEL_TEMPLATE_STATE_NAME, modelTemplateReducer, { initialState: modelTemplatesState }),
            ],
            providers: [
                ModelTemplatesService,
                {
                    provide: MODEL_TEMPLATES_PROVIDER,
                    useValue: {
                        getTemplates: () => of(renditionTemplates),
                        exportTemplate: () => of(null),
                    },
                },
            ],
        });
        service = TestBed.inject(ModelTemplatesService);
        modelTemplatesProvider = TestBed.inject(MODEL_TEMPLATES_PROVIDER);
        store = TestBed.inject(Store);

        dispatchSpy = jest.spyOn(store, 'dispatch');
    });

    describe('getModelTemplates', () => {
        it('should return the list of templates from the store when they are present', async () => {
            const connectors = await service.getModelTemplates(ModelsWithTemplates.CONNECTOR).toPromise();

            expect(dispatchSpy).not.toHaveBeenCalled();
            expect(connectors).toEqual(connectorTemplates);
        });

        it('should return the list of templates from the service when they are not in the store', async () => {
            const renditions = await service.getModelTemplates(ModelsWithTemplates.RENDITION).toPromise();

            expect(dispatchSpy).toHaveBeenCalledWith(new GetModelTemplatesSuccessAction(ModelsWithTemplates.RENDITION, renditionTemplates));
            expect(renditions).toEqual(renditionTemplates);
        });
    });

    describe('getModelTemplate', () => {
        it('should return the templates from the store when it is present', async () => {
            const connector = await service.getModelTemplate(ModelsWithTemplates.CONNECTOR, mockConnectorModelTemplate1.name).toPromise();

            expect(dispatchSpy).not.toHaveBeenCalled();
            expect(connector).toEqual(mockConnectorModelTemplate1);
        });

        it('should return the list of templates from the service when it is not present in the store', async () => {
            const rendition = await service.getModelTemplate(ModelsWithTemplates.RENDITION, mockRenditionModelTemplate1.name).toPromise();

            expect(dispatchSpy).toHaveBeenCalledWith(new GetModelTemplatesSuccessAction(ModelsWithTemplates.RENDITION, renditionTemplates));
            expect(rendition).toEqual(mockRenditionModelTemplate1);
        });

        it('should return undefined when the template does not exist', async () => {
            const rendition = await service.getModelTemplate(ModelsWithTemplates.RENDITION, 'not-existing').toPromise();

            expect(rendition).toBeUndefined();
        });
    });

    describe('exportModelTemplate', () => {
        it('should return the the blob from the templates endpoint', () => {
            const spy = jest.spyOn(modelTemplatesProvider as any, 'exportTemplate');

            service.exportModelTemplate(ModelsWithTemplates.FILE, 'any', 'blob');

            expect(spy).toHaveBeenCalledWith(ModelsWithTemplates.FILE, 'any', 'blob');
        });
    });
});
