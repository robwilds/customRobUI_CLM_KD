/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ProjectTreeModelingModels } from '../models/project-tree-models';
import type { ProjectTreeStructureProvider } from '../providers/project-tree-structure.provider';
import { ProjectTreeGroupNodeType } from '../models/project-tree-group-node';

@Injectable({
    providedIn: 'root',
})
export class ProjectTreeStructureModelingService implements ProjectTreeStructureProvider {
    getStructure(): { [key: ProjectTreeGroupNodeType]: ProjectTreeModelingModels[] } {
        return {
            [ProjectTreeGroupNodeType.processAutomation]: [
                ProjectTreeModelingModels.processes,
                ProjectTreeModelingModels.authentication,
                ProjectTreeModelingModels.connectors,
                ProjectTreeModelingModels.dataModels,
                ProjectTreeModelingModels.decisionTables,
                ProjectTreeModelingModels.files,
                ProjectTreeModelingModels.scripts,
                ProjectTreeModelingModels.triggers,
                ProjectTreeModelingModels.ui,
            ],
            [ProjectTreeGroupNodeType.forms]: [ProjectTreeModelingModels.forms, ProjectTreeModelingModels.formWidgets],
            [ProjectTreeGroupNodeType.content]: [ProjectTreeModelingModels.contentModels],
        };
    }
}
