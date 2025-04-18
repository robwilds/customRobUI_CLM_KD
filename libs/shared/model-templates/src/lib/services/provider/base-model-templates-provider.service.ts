/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ModelsWithTemplates, ModelTemplate, ModelTemplatesResponse } from '../../model/model-templates.model';
import { ModelTemplatesProvider } from './model-templates-provider.service';

@Injectable({
    providedIn: 'root',
})
export class BaseModelTemplatesProvider extends ModelTemplatesProvider {
    public override getTemplates(modelType: ModelsWithTemplates): Observable<ModelTemplate[]> {
        return this.request<ModelTemplatesResponse>(`${this.requestEndpoint}/${modelType}`).pipe(
            map((nodePaging) => nodePaging.list.entries.map((entry) => entry.entry))
        );
    }
}
