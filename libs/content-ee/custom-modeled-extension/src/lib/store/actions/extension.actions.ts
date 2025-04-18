/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { NodeEntry } from '@alfresco/js-api';
import { FormValues } from '@alfresco/adf-core';

export interface SendNamedEventPayload {
    payload: {
        eventName: string;
        nodes: NodeEntry[];
    };
}

export interface OpenFormPayload {
    payload: {
        formDefinitionId: string;
        nodes: NodeEntry[];
        processDefinitionKey?: string;
        processDefinitionName?: string;
    };
}

export interface StartProcessPayload {
    payload: {
        processDefinitionKey: string;
        nodes: NodeEntry[];
    };
}

export interface NavigationPayload {
    payload: {
        target: string;
        blank: boolean;
        nodes: NodeEntry[];
    };
}

export interface CreateProcessInstancePayload {
    processDefinitionKey: string;
    processDefinitionName: string;
    variables: FormValues;
}

export interface SubmitFormPayload {
    formDefinitionId: string;
    variables: FormValues;
}

export const initialiseExtension = createAction(
    '[Custom Modeled Extension] initialise',
    props<{
        health: boolean;
        application: string;
    }>()
);

export const sendNamedEvent = createAction('MODELED_EVENT', props<SendNamedEventPayload>());
export const openForm = createAction('MODELED_FORM', props<OpenFormPayload>());
export const startProcess = createAction('MODELED_PROCESS', props<StartProcessPayload>());
export const navigation = createAction('MODELED_NAVIGATION', props<NavigationPayload>());
export const submitForm = createAction('[Custom Modeled Extension] Submit Form', props<SubmitFormPayload>());
export const createProcessInstance = createAction('[Custom Modeled Extension] Create Process Instance', props<CreateProcessInstancePayload>());
