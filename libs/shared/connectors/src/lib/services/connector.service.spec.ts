/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConnectorService } from './connector.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelTemplate, ModelTemplatesService, ModelsWithTemplates } from '@alfresco-dbp/shared/model-templates';
import { MockProvider } from 'ng-mocks';
import { OOBConnectors } from '../model/oob-connectors';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

describe('FormRulesService', () => {
    let service: ConnectorService;
    const mockConnector: ModelTemplate = {
        id: 1,
        name: 'existingConnector',
        modelType: 'CONNECTOR',
        content: {},
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                MockProvider(ModelTemplatesService, {
                    getModelTemplate: (modelType: ModelsWithTemplates, templateName: string) => {
                        if (templateName === mockConnector.name) {
                            return of(mockConnector);
                        }
                        return of(undefined);
                    },
                }),
            ],
        });
        service = TestBed.inject(ConnectorService);
    });

    describe('getConnectorContent', () => {
        it('should return observable of ConnectorContent when the connector is found', () => {
            const result = service.getConnectorContent(mockConnector.name as OOBConnectors);

            result.subscribe((connector) => {
                expect(connector).toEqual(mockConnector);
            });
        });

        it('should return observable with error when the connector is not found', () => {
            const notExistingConnectorName = 'notExistingConnector';
            const result = service.getConnectorContent(notExistingConnectorName as OOBConnectors);

            result.subscribe(
                () => fail('should not return a connector'),
                (error) => {
                    expect(error).toEqual(`Connector ${notExistingConnectorName} not found`);
                }
            );
        });
    });

    describe('getSvg', () => {
        it('should return svg when the connector name is valid', () => {
            const result = service.getSvg(mockConnector.name);

            expect(result).toEqual('existing');
        });

        it('should return undefined when the connector name is invalid', () => {
            const param: any = undefined;
            const result = service.getSvg(param);

            expect(result).toBeUndefined();
        });
    });

    describe('getIcon', () => {
        it('should return icon when the connector name is valid', () => {
            const result = service.getIcon(mockConnector.name as OOBConnectors);

            expect(result).toEqual('alfresco-oob-icon-existing');
        });

        it('should return undefined when the connector name is invalid', () => {
            const param: any = undefined;
            const result = service.getIcon(param);

            expect(result).toBeUndefined();
        });
    });
});
