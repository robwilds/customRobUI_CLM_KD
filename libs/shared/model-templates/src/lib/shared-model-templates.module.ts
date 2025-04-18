/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { MODEL_TEMPLATE_STATE_NAME } from './+state/model-templates.selectors';
import { modelTemplateReducer } from './+state/model-templates.reducer';
import { ModelTemplatesService } from './services/model-templates.service';
import { BaseModelTemplatesProvider } from './services/provider/base-model-templates-provider.service';
import { provideModelTemplates } from './model/model-templates.model';

@NgModule({
    imports: [StoreModule.forFeature(MODEL_TEMPLATE_STATE_NAME, modelTemplateReducer)],
    providers: [ModelTemplatesService, provideModelTemplates(BaseModelTemplatesProvider)],
})
export class SharedModelTemplatesModule {}
