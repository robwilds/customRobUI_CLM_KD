/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { MODEL_TEMPLATES_PROVIDER, ModelTemplate, ModelTemplateState, ModelsWithTemplates } from '../model/model-templates.model';
import { Observable } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { selectModelTemplatesByModelType, selectModelTemplatesSavingByModelType } from '../+state/model-templates.selectors';
import { GetModelTemplatesSuccessAction } from '../+state/model-templates.actions';
import { Store } from '@ngrx/store';
import { ModelTemplatesProvider } from './provider/model-templates-provider.service';

@Injectable({ providedIn: 'root' })
export class ModelTemplatesService {
    constructor(private store: Store<ModelTemplate>, @Inject(MODEL_TEMPLATES_PROVIDER) private provider: ModelTemplatesProvider) {}

    getModelTemplates(modelType: ModelsWithTemplates): Observable<ModelTemplate[]> {
        return this.store.select(selectModelTemplatesSavingByModelType(modelType)).pipe(
            first(),
            switchMap((status) => {
                return status === ModelTemplateState.SAVED
                    ? this.store.select(selectModelTemplatesByModelType(modelType)).pipe(first())
                    : this.provider
                          .getTemplates(modelType)
                          .pipe(tap((list) => this.store.dispatch(new GetModelTemplatesSuccessAction(modelType, list))));
            })
        );
    }

    getModelTemplate(modelType: ModelsWithTemplates, templateName: string): Observable<ModelTemplate | undefined> {
        return this.getModelTemplates(modelType).pipe(map((templates) => templates.find((template) => template.name === templateName)));
    }

    exportModelTemplate(
        modelType: ModelsWithTemplates,
        templateName: string,
        responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
    ): Observable<any> {
        return this.provider.exportTemplate(modelType, templateName, responseType);
    }
}
