/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocalizedDatePipe, FormValues } from '@alfresco/adf-core';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { filter, switchMap, take, tap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { SnackbarErrorAction, SnackbarInfoAction } from '@alfresco/aca-shared/store';
import { of, from, ReplaySubject, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormActionDialogComponent } from '../components/form-action-dialog/form-action-dialog.component';
import { selectApplicationName } from '../store/selectors/extension.selectors';
import { NodeEntry } from '@alfresco/js-api';
import { Router } from '@angular/router';
import { FormCloudService } from '@alfresco/adf-process-services-cloud';

export interface ProcessDefinition {
    formKey?: string;
    nodes?: NodeEntry[];
    key?: string;
    name?: string;
    version?: number;
}

export interface ProcessDefinitionEntry {
    entry: ProcessDefinition;
}

export interface ProcessDefinitionList {
    list: { entries: ProcessDefinitionEntry[] };
}

@Injectable({
    providedIn: 'root',
})
export class CustomModeledExtensionExtensionService extends FormCloudService {
    runtimeBundleServicesCloudRunning = false;
    private config$: ReplaySubject<any>;

    constructor(
        private store: Store<any>,
        adfHttpClient: AdfHttpClient,
        private dialog: MatDialog,
        private localizedDatePipe: LocalizedDatePipe,
        @Inject(DOCUMENT) private document: Document,
        private router: Router
    ) {
        super(adfHttpClient);
        this.config$ = new ReplaySubject(1);
        this.appConfigService.onLoad.pipe(take(1)).subscribe((config) => {
            this.config$.next(config);
        });
    }

    checkBackendHealth(): Observable<boolean> {
        return this.config$.pipe(
            withLatestFrom(this.apiService.alfrescoApiInitialized),
            filter(([, status]) => status),
            take(1),
            switchMap(([config]) =>
                from(
                    this.adfHttpClient.request(
                        `${this.appConfigService.get('bpmHost', '')}/${config['alfresco-deployed-apps'][0].name}/rb/actuator/health`,
                        {
                            httpMethod: 'GET',
                            contentTypes: ['application/json'],
                            responseType: 'application/json',
                        }
                    )
                )
            ),
            map((response) => {
                const health = response.status === 'UP';
                return health;
            }),
            tap((health) => {
                this.runtimeBundleServicesCloudRunning = health;
            }),
            catchError(() => {
                this.runtimeBundleServicesCloudRunning = false;
                return of(false);
            })
        );
    }

    showError(message: string) {
        this.store.dispatch(new SnackbarErrorAction(message));
    }

    showInfo(message: string) {
        this.store.dispatch(new SnackbarInfoAction(message));
    }

    openFormActionDialog(formDefinitionId: string, nodes: NodeEntry[], processDefinitionKey: string, processDefinitionName: string) {
        this.store.select(selectApplicationName).subscribe((appName) => {
            this.dialog.open(FormActionDialogComponent, {
                data: { formDefinitionId, appName, nodes, processDefinitionKey, processDefinitionName },
                minWidth: '50%',
                height: '75%',
            });
        });
    }

    getLatestProcessDefinition(processDefinitionKey: string, nodes: NodeEntry[]): Observable<ProcessDefinition> {
        return this.store.select(selectApplicationName).pipe(
            switchMap((appName) => {
                const url = `${this.appConfigService.get('bpmHost', '')}/${appName}/rb/v1/process-definitions`;

                return this.get<ProcessDefinitionList>(url).pipe(
                    map((res: ProcessDefinitionList) => {
                        const processDefinitionsSortedByVersionDescending = res.list.entries
                            .filter((entry) => entry.entry.key === processDefinitionKey)
                            .sort((a, b) => (a.entry.version < b.entry.version ? 1 : -1));
                        return { ...processDefinitionsSortedByVersionDescending[0].entry, nodes };
                    })
                );
            })
        );
    }

    startProcess(processDefinitionKey: string, processDefinitionName: string, variables: FormValues) {
        this.store.select(selectApplicationName).subscribe((appName) => {
            const url = `${this.appConfigService.get('bpmHost', '')}/${appName}/rb/v1/process-instances`;
            const presentDateTime = new Date();
            const dataTime = this.localizedDatePipe.transform(presentDateTime, 'medium');
            const generatedName = processDefinitionName + ' - ' + dataTime;
            const payload = {
                payloadType: 'StartProcessPayload',
                processDefinitionKey,
                businessKey: generatedName,
                name: generatedName,
                variables: this.cleanNullOrUndefinedAttributes(variables),
            };
            this.post(url, payload).subscribe(
                () => this.showInfo('CUSTOM_MODELED_EXTENSION.SNACKBAR.PROCESS_CREATED_SUCCESSFULLY'),
                (error: any) => this.showError(error.message)
            );
        });
    }

    submitForm(formDefinitionId: string, variables: { values: FormValues }) {
        this.store.select(selectApplicationName).subscribe((appName) => {
            const url = `${this.appConfigService.get('bpmHost', '')}/${appName}/form/v1/user-action/form/${formDefinitionId}/submit`;
            this.post(url, { values: this.cleanNullOrUndefinedAttributes(variables?.values) }).subscribe(
                () => this.showInfo('CUSTOM_MODELED_EXTENSION.SNACKBAR.FORM_SUBMITTED_SUCCESSFULLY'),
                (error) => this.showError(error.message)
            );
        });
    }

    sendNamedEvent(eventName: string, nodes: NodeEntry[]) {
        this.store.select(selectApplicationName).subscribe((appName) => {
            const window = this.document.defaultView;
            const uiName = window.location.href
                .replace(window.location.origin, '')
                .replace(`/${appName}`, '')
                .replace('/ui/', '')
                .replace('/#', '')
                .replace(this.router.url, '');
            const url = `${this.appConfigService.get('bpmHost', '')}/${appName}/form/v1/user-action/event/${
                uiName && uiName.trim().length > 0 ? uiName : 'content'
            }/${eventName}/send`;
            const payload = {
                nodes: nodes ? nodes.map((node) => node.entry) : [],
            };
            this.post(url, payload).subscribe(
                () => this.showInfo('CUSTOM_MODELED_EXTENSION.SNACKBAR.ACTION_PERFORMED_SUCCESSFULLY'),
                (error: any) => this.showError(error.message)
            );
        });
    }

    navigate(target: string, nodes: NodeEntry[], blank: boolean) {
        if (nodes) {
            target = this.substituteNodesPlaceholder(target, nodes);
        }
        target = this.getFinalURL(target);
        this.document.defaultView.open(target, blank ? '_blank' : '_self');
    }

    private cleanNullOrUndefinedAttributes(values: FormValues): FormValues {
        if (values) {
            Object.keys(values).forEach(function (key) {
                if (values[key] === undefined || values[key] === null) {
                    delete values[key];
                }
            });
        }
        return values;
    }

    private getFinalURL(target: string): string {
        if (this.isInternalTarget(target)) {
            if (!target.startsWith('/')) {
                target = '/' + target;
            }
            const baseUrl = this.document.defaultView.location.href.replace(this.router.url, '');
            target = baseUrl + target;
        }
        return target;
    }

    private isInternalTarget(target: string): boolean {
        const protocol = /^[a-zA-Z0-9]+:\/\/?/;
        return !target.match(protocol);
    }

    private substituteNodesPlaceholder(target: string, nodes: NodeEntry[]): string {
        const placeholder = '${nodes}';
        let nodesString = '';
        for (let index = 0; index < nodes.length; index++) {
            nodesString += nodes[index].entry.id;
            if (index < nodes.length - 1) {
                nodesString += ',';
            }
        }
        return target.replace(placeholder, nodesString);
    }
}
