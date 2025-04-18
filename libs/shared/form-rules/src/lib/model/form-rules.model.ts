/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Predicate } from './conditions.model';

export const FORM_PREFIX = 'form.';
export const FIELD_PREFIX = 'field.';
export const VARIABLE_PREFIX = 'variable.';
export const VARIABLES_PREFIX = 'variables.';
export const START_PROCESS_PREFIX = 'startProcess.';
export const TOGGLE_SPINNER_PREFIX = 'toggleSpinner.';
export const PROCESS_VARIABLES_PREFIX = 'process.variable.';

export type FormRuleEventActionTarget = 'toggleSpinner' | 'startProcess' | string;
export interface FormRuleEventAction {
    target: FormRuleEventActionTarget;
    payload: PayloadBody;
}

export interface FormRuleEventPayload {
    filter?: string | Predicate;
    actions: FormRuleEventAction[];
}

export interface PayloadBody {
    [key: string]: any;
}

export interface FormRules {
    form?: {
        [event: string]: FormRuleEventPayload[];
    };
    fields?: {
        [fieldId: string]: {
            [event: string]: FormRuleEventPayload[];
        };
    };
}

export interface FormRulesContext {
    field?: PayloadBody;
    variable?: PayloadBody;
}

export enum FormActions {
    VALIDATE = 'validate',
    START_PROCESS = 'startProcess',
    TOGGLE_SPINNER = 'toggleSpinner',
    SHOW_SPINNER = 'showSpinner',
    HIDE_SPINNER = 'hideSpinner',
}

export enum VariablesInputs {
    VALUE = 'value',
}

export enum StartProcessPayload {
    INPUTS = 'inputs',
    PROCESS_NAME = 'processName',
    CORRELATION_KEY = 'correlationKey',
}

export enum ShowSpinnerPayload {
    MESSAGE = 'message',
    SHOW_SPINNER = 'showSpinner',
}

export enum HideSpinnerPayload {
    SHOW_SPINNER = 'showSpinner',
}

export enum FieldInputs {
    DISPLAY = 'display',
    DISABLED = 'disabled',
    REQUIRED = 'required',
    VALUE = 'value',
}

export const FormActionsUtils = {
    getType(action: string, defaultType = 'string'): string {
        switch (action) {
            case StartProcessPayload.INPUTS: {
                return 'start-process-inputs';
            }
            case ShowSpinnerPayload.MESSAGE:
            case FieldInputs.VALUE:
            case VariablesInputs.VALUE: {
                return defaultType;
            }
            case ShowSpinnerPayload.SHOW_SPINNER: {
                return 'boolean';
            }
            default: {
                return 'boolean';
            }
        }
    },

    getFieldInputsValues(): string[] {
        return Object.values(FieldInputs);
    },

    getVariableInputsValues(): string[] {
        return Object.values(VariablesInputs);
    },

    getFormActionInputs(action: string): string[] {
        switch (action) {
            case FormActions.SHOW_SPINNER: {
                return [ShowSpinnerPayload.MESSAGE];
            }
            case FormActions.START_PROCESS: {
                return [StartProcessPayload.INPUTS];
            }
            case FormActions.HIDE_SPINNER:
            case FormActions.VALIDATE: {
                return [];
            }
            default: {
                return [];
            }
        }
    },
};
