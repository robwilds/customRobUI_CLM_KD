/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ConnectorContent } from '../model/connector-content.model';
import { OOBConnectors } from '../model/oob-connectors';
import { ModelTemplate, ModelTemplatesService, ModelsWithTemplates } from '@alfresco-dbp/shared/model-templates';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConnectorService {
    protected contentConnectors: OOBConnectors[] = [OOBConnectors.CONTENT, OOBConnectors.HXP_CONTENT];

    protected serviceConnectors: OOBConnectors[] = [...this.contentConnectors, OOBConnectors.DOCGEN, OOBConnectors.EMAIL];

    protected connectorsWithEvents: OOBConnectors[] = [
        OOBConnectors.REST,
        OOBConnectors.TWILIO,
        OOBConnectors.DOCUSIGN,
        OOBConnectors.SLACK,
        OOBConnectors.MICROSOFT_EMAIL,
    ];

    constructor(private modelTemplatesService: ModelTemplatesService) {}

    getConnectorContent(connectorName: OOBConnectors): Observable<ConnectorContent> {
        return this.getConnector(connectorName).pipe(map((modelTemplate) => modelTemplate.content as ConnectorContent));
    }

    getSvg(connectorName: string): string | undefined {
        return connectorName?.toLowerCase().replace('connector', '');
    }

    getIcon(connectorName: OOBConnectors): string | undefined {
        const svg = this.getSvg(connectorName);
        return svg ? `alfresco-oob-icon-${svg}` : undefined;
    }

    getConnectorsWithEvents(): Observable<ModelTemplate[]> {
        return this.modelTemplatesService
            .getModelTemplates(ModelsWithTemplates.CONNECTOR)
            .pipe(map((connectors) => connectors.filter((connector) => this.connectorsWithEvents.includes(connector.name as OOBConnectors))));
    }

    getConnectorsWithoutServices(): Observable<ModelTemplate[]> {
        return this.modelTemplatesService
            .getModelTemplates(ModelsWithTemplates.CONNECTOR)
            .pipe(map((connectors) => connectors.filter((connector) => !this.serviceConnectors.includes(connector.name as OOBConnectors))));
    }

    private getConnector(connectorName: string): Observable<ModelTemplate> {
        return this.modelTemplatesService
            .getModelTemplate(ModelsWithTemplates.CONNECTOR, connectorName)
            .pipe(switchMap((modelTemplate) => (modelTemplate ? of(modelTemplate) : throwError(`Connector ${connectorName} not found`))));
    }
}
