/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MODEL_TEMPLATE_STATE_NAME, selectModelTemplatesByModelType } from './model-templates.selectors';
import { ModelTemplate, ModelsWithTemplates } from '../model/model-templates.model';
import { modelTemplateReducer } from './model-templates.reducer';
import { GetModelTemplatesSuccessAction } from './model-templates.actions';
import { mockConnectorModelTemplate1, mockConnectorModelTemplate2 } from '../mocks/model-templates.mock';

describe('Model templates reducers', () => {
    let store: Store<ModelTemplate>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot({}), StoreModule.forFeature(MODEL_TEMPLATE_STATE_NAME, modelTemplateReducer)],
        });
        store = TestBed.inject(Store);
    });

    it('should update store with the provided list when GetModelTemplatesSuccessAction is dispatched', (done) => {
        store.dispatch(new GetModelTemplatesSuccessAction(ModelsWithTemplates.CONNECTOR, [mockConnectorModelTemplate1, mockConnectorModelTemplate2]));
        store.select(selectModelTemplatesByModelType(ModelsWithTemplates.CONNECTOR)).subscribe((result) => {
            expect(result).toEqual([mockConnectorModelTemplate1, mockConnectorModelTemplate2]);
            done();
        });
    });
});
