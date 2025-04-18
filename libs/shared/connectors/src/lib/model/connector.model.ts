/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConnectorContent } from './connector-content.model';

export interface Connector {
    id: string;
    name: string;
    key?: string;
    image?: string;
    template?: string;
    modelType?: string;
    description?: string;
    description_key?: string;
    content?: ConnectorContent;
}
