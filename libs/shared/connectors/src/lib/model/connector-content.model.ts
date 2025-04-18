/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConnectorConfigParameter } from './connector-config-parameter.model';
import { ConnectorError } from './connector-error.model';

export interface ConnectorContent {
    name: string;
    key?: string;
    template?: string;
    description?: string;
    config?: ConnectorConfigParameter[];
    actions?: any;
    events?: any;
    errors?: ConnectorError[];
}
