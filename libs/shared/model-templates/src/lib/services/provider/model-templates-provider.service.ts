/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AdfHttpClient, RequestOptions } from '@alfresco/adf-core/api';
import { Observable, defer, from } from 'rxjs';
import { ModelsWithTemplates, ModelTemplate } from '../../model/model-templates.model';
import { AppConfigService, StorageService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export abstract class ModelTemplatesProvider {
    private requestOptions: RequestOptions = {
        pathParams: {},
        queryParams: {
            maxItems: 1000,
        },
        headerParams: {},
        formParams: {},
        bodyParam: {},
        contentTypes: ['application/json'],
        accepts: ['application/json'],
        returnType: null,
        httpMethod: 'GET',
    };

    protected requestEndpoint = '/modeling-service/v1/templates';

    constructor(private appConfig: AppConfigService, private storageService: StorageService, private adfHttpClient: AdfHttpClient) {}

    public abstract getTemplates(modelType: ModelsWithTemplates): Observable<ModelTemplate[]>;

    public exportTemplate(
        modelType: ModelsWithTemplates,
        templateName: string,
        responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
    ) {
        return this.request<any>(`${this.requestEndpoint}/${modelType}/${templateName}/export`, responseType);
    }

    protected request<T>(endpoint: string, responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'): Observable<T> {
        return defer(() => from(this.adfHttpClient.request(this.buildUrl(endpoint), this.getRequestOptions(responseType))));
    }

    private getRequestOptions(responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text') {
        return {
            ...this.requestOptions,
            responseType,
        };
    }

    private buildUrl(endPoint: string): string {
        const trimSlash = (str: string) => str.replace(/^\/|\/$/g, '');
        const path = '/' + trimSlash(endPoint);

        const host = this.storageService.hasItem('bpmHost') ? this.storageService.getItem('bpmHost') : trimSlash(this.appConfig.get('bpmHost'));

        return `${host}${path}`;
    }
}
