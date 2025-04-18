/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { hot } from 'jasmine-marbles';
import { CustomModeledExtensionEffects } from './custom-modeled-extension.effects';
import { CustomModeledExtensionTestingModule } from '../../testing/custom-modeled-extension-testing.module';
import {
    createProcessInstance,
    initialiseExtension,
    navigation,
    openForm,
    sendNamedEvent,
    startProcess,
    StartProcessPayload,
    submitForm,
} from '../actions/extension.actions';
import { SnackbarErrorAction } from '@alfresco/aca-shared/store';
import { CustomModeledExtensionExtensionService } from '../../services/custom-modeled-extension.service';

describe('CustomModeledExtensionEffects', () => {
    let effects: CustomModeledExtensionEffects;
    let actions$: Observable<Action>;
    let service: CustomModeledExtensionExtensionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CustomModeledExtensionTestingModule],
            providers: [
                CustomModeledExtensionEffects,
                provideMockActions(() => actions$),
                {
                    provide: CustomModeledExtensionExtensionService,
                    useValue: {
                        checkBackendHealth: () => of(true),
                        showError: () => {},
                        showInfo: () => {},
                        openFormActionDialog: () => {},
                        getLatestProcessDefinition: () =>
                            of({
                                formKey: 'mockFormDefinitionId',
                                key: 'mockProcessDefinitionKey',
                                nodes: [],
                                name: 'mockProcessDefinitionName',
                            }),
                        startProcess: () => {},
                        submitForm: () => {},
                        sendNamedEvent: () => {},
                        navigate: () => {},
                    },
                },
            ],
        });
        effects = TestBed.inject(CustomModeledExtensionEffects);
        service = TestBed.inject(CustomModeledExtensionExtensionService);
    });

    it('Should dispatch a warning log action if the health is false', (done) => {
        actions$ = of(initialiseExtension({ health: false, application: '' }));

        effects.updateHealth$.subscribe((action) => {
            expect(action).toEqual(new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.BACKEND_SERVICE_ERROR'));
            done();
        });
    });

    it('Should dispatch nothing if the health is true', () => {
        actions$ = hot('-a-', {
            a: initialiseExtension({ health: true, application: '' }),
        });

        const expected$ = hot('---');

        expect(effects.updateHealth$).toBeObservable(expected$);
    });

    it('Should call backend when sending a named event', () => {
        const serviceSpy = spyOn(service, 'sendNamedEvent');
        actions$ = of(
            sendNamedEvent({
                payload: {
                    eventName: 'mockEvent',
                    nodes: [],
                },
            })
        );

        effects.sendNamedEvent$.subscribe(() => {});
        expect(serviceSpy).toHaveBeenCalledWith('mockEvent', []);
    });

    it('Should open form when requested', () => {
        const serviceSpy = spyOn(service, 'openFormActionDialog');
        actions$ = of(
            openForm({
                payload: {
                    formDefinitionId: 'mockFormDefinitionId',
                    nodes: [],
                    processDefinitionKey: 'mockProcessDefinitionKey',
                    processDefinitionName: 'mockProcessDefinitionName',
                },
            })
        );

        effects.openForm$.subscribe(() => {});
        expect(serviceSpy).toHaveBeenCalledWith('mockFormDefinitionId', [], 'mockProcessDefinitionKey', 'mockProcessDefinitionName');
    });

    it('Should submit form when requested', () => {
        const serviceSpy = spyOn(service, 'submitForm');
        const formSubmit = {
            formDefinitionId: 'mockFormDefinitionId',
            variables: {
                var1: 'value1',
                var2: true,
            },
        };
        actions$ = of(submitForm(formSubmit));

        effects.submitForm$.subscribe(() => {});
        expect(serviceSpy).toHaveBeenCalledWith(formSubmit.formDefinitionId, { values: formSubmit.variables });
    });

    it('Should start process when requested', () => {
        const serviceSpy = spyOn(service, 'startProcess');
        const createProcessAction = {
            processDefinitionKey: 'mockProcessDefinitionKey',
            processDefinitionName: 'mockProcessDefinitionName',
            variables: {
                var1: 'value1',
                var2: true,
            },
        };
        actions$ = of(createProcessInstance(createProcessAction));

        effects.createProcessInstance$.subscribe(() => {});
        expect(serviceSpy).toHaveBeenCalledWith(
            createProcessAction.processDefinitionKey,
            createProcessAction.processDefinitionName,
            createProcessAction.variables
        );
    });

    it('Should include nodes as process variables when starting a process', () => {
        const createProcessAction: StartProcessPayload = {
            payload: {
                processDefinitionKey: 'mockProcessDefinitionKey',
                nodes: [
                    {
                        entry: {
                            createdAt: new Date(),
                            createdByUser: {
                                displayName: 'testUser',
                                id: 'testUser',
                            },
                            id: 'node',
                            isFile: true,
                            isFolder: false,
                            modifiedAt: new Date(),
                            modifiedByUser: {
                                displayName: 'testUser',
                                id: 'testUser',
                            },
                            name: 'testNode',
                            nodeType: 'any',
                        },
                    },
                ],
            },
        };

        spyOn(service, 'getLatestProcessDefinition').and.returnValue(
            of({
                nodes: createProcessAction.payload.nodes,
                key: 'mockProcessDefinitionKey',
                name: 'mockProcessDefinitionName',
                version: 1,
            })
        );

        actions$ = hot('-a-', { a: startProcess(createProcessAction) });

        const expected$ = hot('-b-', {
            b: {
                type: '[Custom Modeled Extension] Create Process Instance',
                processDefinitionKey: 'mockProcessDefinitionKey',
                processDefinitionName: 'mockProcessDefinitionName',
                variables: { nodes: createProcessAction.payload.nodes },
            },
        });

        expect(effects.startProcess$).toBeObservable(expected$);
    });

    it('Should navigate when requested', () => {
        const serviceSpy = spyOn(service, 'navigate');
        const navigateAction = {
            payload: {
                target: 'http://mock.com',
                blank: true,
                nodes: [],
            },
        };
        actions$ = of(navigation(navigateAction));

        effects.navigation$.subscribe(() => {});
        expect(serviceSpy).toHaveBeenCalledWith(navigateAction.payload.target, navigateAction.payload.nodes, navigateAction.payload.blank);
    });

    it('Should open form when process has start form', () => {
        spyOn(service, 'getLatestProcessDefinition').and.returnValue(
            of({
                formKey: 'mockFormDefinitionId',
                key: 'mockProcessDefinitionKey',
                nodes: [],
                name: 'mockProcessDefinitionName',
                version: 1,
            })
        );
        const createProcessAction = {
            payload: {
                processDefinitionKey: 'mockProcessDefinitionKey',
                nodes: [],
            },
        };
        actions$ = hot('-a-', { a: startProcess(createProcessAction) });

        const expected$ = hot('-b-', {
            b: {
                type: 'MODELED_FORM',
                payload: {
                    formDefinitionId: 'mockFormDefinitionId',
                    nodes: [],
                    processDefinitionKey: 'mockProcessDefinitionKey',
                    processDefinitionName: 'mockProcessDefinitionName',
                },
            },
        });

        expect(effects.startProcess$).toBeObservable(expected$);
    });

    it('Should create process instance when process has start form', () => {
        spyOn(service, 'getLatestProcessDefinition').and.returnValue(
            of({
                key: 'mockProcessDefinitionKey',
                nodes: [],
                name: 'mockProcessDefinitionName',
                version: 1,
            })
        );
        const createProcessAction = {
            payload: {
                processDefinitionKey: 'mockProcessDefinitionKey',
                nodes: [],
            },
        };
        actions$ = hot('-a-', { a: startProcess(createProcessAction) });

        const expected$ = hot('-b-', {
            b: {
                type: '[Custom Modeled Extension] Create Process Instance',
                processDefinitionKey: 'mockProcessDefinitionKey',
                processDefinitionName: 'mockProcessDefinitionName',
                variables: null,
            },
        });

        expect(effects.startProcess$).toBeObservable(expected$);
    });

    it('Should display error when process definition not exists', (done) => {
        spyOn(service, 'getLatestProcessDefinition').and.returnValue(of(null));
        const createProcessAction = {
            payload: {
                processDefinitionKey: 'mockProcessDefinitionKey',
                nodes: [],
            },
        };
        actions$ = of(startProcess(createProcessAction));

        effects.startProcess$.subscribe((action) => {
            expect(action).toEqual(new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.NO_PROCESS_DEFINITION_ERROR'));
            done();
        });
    });
});
