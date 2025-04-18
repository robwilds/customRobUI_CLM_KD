/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken, Provider, Type } from '@angular/core';
import type { ProjectTreeModelType } from '../models/project-tree-models';
import type { ProjectTreeGroupNodeType } from '../models/project-tree-group-node';

export const PROJECT_TREE_STRUCTURE_PROVIDER = new InjectionToken<ProjectTreeStructureProvider>('PROJECT_TREE_STRUCTURE');

export interface ProjectTreeStructureProvider {
    getStructure(): { [key: ProjectTreeGroupNodeType]: ProjectTreeModelType[] };
}

export function provideProjectTreeStructure(service: Type<ProjectTreeStructureProvider>): Provider {
    return {
        provide: PROJECT_TREE_STRUCTURE_PROVIDER,
        useClass: service
    };
}
