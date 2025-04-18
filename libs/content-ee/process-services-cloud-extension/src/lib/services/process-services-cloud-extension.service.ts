/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { ExtensionColumnPreset } from '../models/extension-column-preset.interface';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProcessDefinitionsVariableColumnsSchema } from '../store/selectors/datatable-columns-schema.selector';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ProcessServicesCloudExtensionService {
    constructor(protected extensionService: ExtensionService, private store: Store<any>) {}

    getProcessColumns(presetKey: string): Observable<ExtensionColumnPreset[]> {
        return this.store.select(selectProcessDefinitionsVariableColumnsSchema).pipe(
            map((variableColumns) => {
                const columnsSchema = [...this.getProcessListPreset(presetKey), ...variableColumns];

                return columnsSchema;
            })
        );
    }

    getTasksColumns(presetKey: string): Observable<ExtensionColumnPreset[]> {
        return this.store.select(selectProcessDefinitionsVariableColumnsSchema).pipe(
            map((variableColumns) => {
                const columnsSchema = [...this.getTaskListPreset(presetKey), ...variableColumns];

                return columnsSchema;
            })
        );
    }

    getProcessListPreset(key: string): ExtensionColumnPreset[] {
        return this.extensionService.getElements<any>(`features.processList.presets.${key}`).filter((entry) => !entry.disabled);
    }

    isColumnResizingEnabled(key: string): boolean {
        return !!this.extensionService.getElements<any>(key).filter(({ id = '', enabled = false }) => id === 'column-resizing' && enabled).length;
    }

    getTaskListPreset(key: string): ExtensionColumnPreset[] {
        return this.extensionService.getElements<any>(`features.taskList.presets.${key}`).filter((entry) => !entry.disabled);
    }
}
