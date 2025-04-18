/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MODEL_TEMPLATE_STATE_NAME, selectModelTemplatesByModelType, selectModelTemplatesSavingByModelType } from './model-templates.selectors';
import { ModelTemplate, ModelTemplateState, ModelsWithTemplates } from '../model/model-templates.model';
import { modelTemplateReducer } from './model-templates.reducer';
import {
    mockConnectorModelTemplate1,
    mockConnectorModelTemplate2,
    mockConnectorModelTemplate3,
    modelTemplatesState,
} from '../mocks/model-templates.mock';

describe('Model templates selectors', () => {
    let store: Store<ModelTemplate>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({}),
                StoreModule.forFeature(MODEL_TEMPLATE_STATE_NAME, modelTemplateReducer, { initialState: modelTemplatesState }),
            ],
        });
        store = TestBed.inject(Store);
    });

    describe('selectModelTemplatesSavingByModelType', () => {
        it('should return saved status when the status in the store is saved', (done) => {
            store.select(selectModelTemplatesSavingByModelType(ModelsWithTemplates.CONNECTOR)).subscribe((result) => {
                expect(result).toEqual(ModelTemplateState.SAVED);
                done();
            });
        });

        it('should return initial status when the status in the store is initial', (done) => {
            store.select(selectModelTemplatesSavingByModelType(ModelsWithTemplates.RENDITION)).subscribe((result) => {
                expect(result).toEqual(ModelTemplateState.INITIAL);
                done();
            });
        });
    });

    describe('selectModelTemplatesByModelType', () => {
        it('should return model templates if status is saved', (done) => {
            store.select(selectModelTemplatesByModelType(ModelsWithTemplates.CONNECTOR)).subscribe((result) => {
                expect(result).toEqual([mockConnectorModelTemplate1, mockConnectorModelTemplate2, mockConnectorModelTemplate3]);
                done();
            });
        });

        it('should return empty model templates array if status is initial', (done) => {
            store.select(selectModelTemplatesByModelType(ModelsWithTemplates.RENDITION)).subscribe((result) => {
                expect(result).toEqual([]);
                done();
            });
        });
    });
});
