/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ProjectTreeStudioModels } from '../models/project-tree-models';
import type { ProjectTreeStructureProvider } from '../providers/project-tree-structure.provider';
import { ProjectTreeGroupNodeType } from '../models/project-tree-group-node';

@Injectable({
    providedIn: 'root',
})
export class ProjectTreeStructureStudioService implements ProjectTreeStructureProvider {
    getStructure(): { [key: ProjectTreeGroupNodeType]: ProjectTreeStudioModels[] } {
        return {
            [ProjectTreeGroupNodeType.processAutomation]: [
                ProjectTreeStudioModels.processes,
                ProjectTreeStudioModels.authentication,
                ProjectTreeStudioModels.connectors,
                ProjectTreeStudioModels.dataModels,
                ProjectTreeStudioModels.decisionTables,
                ProjectTreeStudioModels.files,
                ProjectTreeStudioModels.scripts,
                ProjectTreeStudioModels.triggers,
                ProjectTreeStudioModels.ui,
            ],
            [ProjectTreeGroupNodeType.forms]: [ProjectTreeStudioModels.forms, ProjectTreeStudioModels.formWidgets],
            [ProjectTreeGroupNodeType.content]: [
                ProjectTreeStudioModels.contentTypes,
                ProjectTreeStudioModels.mixins,
                ProjectTreeStudioModels.schemas,
                ProjectTreeStudioModels.securityPolicy,
                ProjectTreeStudioModels.rendition,
            ],
            [ProjectTreeGroupNodeType.idp]: [ProjectTreeStudioModels.idpConfiguration],
        };
    }
}
