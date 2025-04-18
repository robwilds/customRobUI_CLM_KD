/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { SnackbarErrorAction } from '@alfresco/aca-shared/store';
import {
    initialiseExtension,
    sendNamedEvent,
    openForm,
    startProcess,
    createProcessInstance,
    submitForm,
    navigation,
} from '../actions/extension.actions';
import { CustomModeledExtensionExtensionService } from '../../services/custom-modeled-extension.service';

@Injectable()
export class CustomModeledExtensionEffects {
    updateHealth$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(initialiseExtension),
                filter((action) => !action.health),
                map(() => new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'))
            ),
        { dispatch: true }
    );

    sendNamedEvent$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(sendNamedEvent),
                filter((action) => action.payload?.eventName !== null && action.payload?.eventName !== undefined),
                tap((action) => this.customModeledExtensionExtensionService.sendNamedEvent(action.payload.eventName, action.payload.nodes))
            ),
        { dispatch: false }
    );

    openForm$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openForm),
                filter((action) => action.payload?.formDefinitionId !== null && action.payload?.formDefinitionId !== undefined),
                tap((action) =>
                    this.customModeledExtensionExtensionService.openFormActionDialog(
                        action.payload.formDefinitionId,
                        action.payload.nodes,
                        action.payload.processDefinitionKey,
                        action.payload.processDefinitionName
                    )
                )
            ),
        { dispatch: false }
    );

    submitForm$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(submitForm),
                filter((action) => action.formDefinitionId !== null && action.formDefinitionId !== undefined),
                tap((action) => this.customModeledExtensionExtensionService.submitForm(action.formDefinitionId, { values: action.variables }))
            ),
        { dispatch: false }
    );

    startProcess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(startProcess),
                filter((action) => action.payload?.processDefinitionKey !== null && action.payload?.processDefinitionKey !== undefined),
                switchMap((action) =>
                    this.customModeledExtensionExtensionService.getLatestProcessDefinition(action.payload.processDefinitionKey, action.payload.nodes)
                ),
                map((processDefinition) => {
                    if (processDefinition?.formKey) {
                        return openForm({
                            payload: {
                                formDefinitionId: processDefinition.formKey,
                                nodes: processDefinition.nodes,
                                processDefinitionKey: processDefinition.key,
                                processDefinitionName: processDefinition.name,
                            },
                        });
                    } else if (processDefinition?.key) {
                        const variables = !!processDefinition.nodes && processDefinition.nodes.length > 0 ? { nodes: processDefinition.nodes } : null;
                        return createProcessInstance({
                            processDefinitionKey: processDefinition.key,
                            processDefinitionName: processDefinition.name,
                            variables,
                        });
                    } else {
                        return new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.NO_PROCESS_DEFINITION_ERROR');
                    }
                })
            ),
        { dispatch: true }
    );

    createProcessInstance$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(createProcessInstance),
                filter((action) => action.processDefinitionKey !== null && action.processDefinitionKey !== undefined),
                tap((action) =>
                    this.customModeledExtensionExtensionService.startProcess(
                        action.processDefinitionKey,
                        action.processDefinitionName,
                        action.variables
                    )
                )
            ),
        { dispatch: false }
    );

    navigation$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigation),
                filter((action) => action.payload && action.payload.target !== null && action.payload.target !== undefined),
                tap((action) =>
                    this.customModeledExtensionExtensionService.navigate(action.payload.target, action.payload.nodes, action.payload.blank)
                )
            ),
        { dispatch: false }
    );

    constructor(private actions$: Actions, private customModeledExtensionExtensionService: CustomModeledExtensionExtensionService) {}
}
