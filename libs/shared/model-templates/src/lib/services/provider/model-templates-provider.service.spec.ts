/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';

import { ModelTemplatesProvider } from './model-templates-provider.service';
import { ModelsWithTemplates } from '../../model/model-templates.model';
import { AppConfigService, AppConfigServiceMock } from '@alfresco/adf-core';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { MockProvider } from 'ng-mocks';
import { mockRenditionModelTemplate1, mockRenditionModelTemplate2 } from '../../mocks/model-templates.mock';
import { HttpClientModule } from '@angular/common/http';

describe('ModelTemplatesProvider', () => {
    let service: ModelTemplatesProvider;

    const mockResponse = Promise.resolve({
        list: {
            entries: [{ entry: mockRenditionModelTemplate1 }, { entry: mockRenditionModelTemplate2 }],
        },
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                MockProvider(AdfHttpClient, {
                    request: () => mockResponse as any,
                }),
            ],
        });

        service = TestBed.inject(ModelTemplatesProvider);
    });

    it('should perform request with correct params for exporting template', () => {
        const spy = jest.spyOn(service as any, 'request');

        service.exportTemplate(ModelsWithTemplates.FILE, 'any', 'blob');

        expect(spy).toHaveBeenCalledWith('/modeling-service/v1/templates/FILE/any/export', 'blob');
    });
});
