/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormOutcomeEvent, FormOutcomeModel, FormModel, NotificationService, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskFilterCloudService, TaskCloudModule, TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { TaskDetailsCloudExtComponent } from './task-details-cloud-ext.component';
import {
    fakeTaskDetails,
    suspendedTaskDetailsCloudMock,
    cancelledTaskDetailsCloudMock,
    completedTaskDetailsCloudMock,
    createdTaskDetailsCloudMock,
    assignedTaskDetailsCloudMock,
} from '../../mock/task-details.mock';
import { navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { By } from '@angular/platform-browser';
import { openTaskAssignmentDialog, taskCompletedRedirection } from '../../../../store/actions/task-details.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { STORE_ACTIONS_PROVIDER } from '../../../../services/process-services-cloud-extension-actions.provider';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FeaturesServiceToken, IFeaturesService, provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';

describe('TaskDetailsCloudExtComponent', () => {
    let component: TaskDetailsCloudExtComponent;
    let fixture: ComponentFixture<TaskDetailsCloudExtComponent>;
    let store: MockStore<any>;
    let taskCloudService: TaskCloudService;
    let location: Location;
    let featureService: IFeaturesService;
    let getTaskByIdSpy: jasmine.Spy;
    let getCandidateUsersSpy: jasmine.Spy;
    let getCandidateGroupsSpy: jasmine.Spy;
    let notificationService: NotificationService;
    let router: Router;
    const mockRouterParams = new Subject();
    const mockActionType = { type: 'MOCK_SET_FILE_UPLOADING_DIALOG' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                NoopAuthModule,
                EffectsModule.forRoot([]),
                StoreModule.forRoot({}),
                TaskCloudModule,
                MatSnackBarModule,
                TaskDetailsCloudExtComponent,
            ],
            providers: [
                {
                    provide: TaskFilterCloudService,
                    useValue: {
                        getTaskFilterById: () => of([]),
                        getTaskListFilters: () =>
                            of([
                                {
                                    key: TaskDetailsCloudExtComponent.COMPLETED_TASK,
                                    id: 'completed-task-filter-id',
                                },
                            ]),
                    },
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: mockRouterParams,
                    },
                },
                {
                    provide: STORE_ACTIONS_PROVIDER,
                    useValue: {
                        getOnInitAction() {
                            return mockActionType;
                        },
                        getOnDestroyAction() {
                            return mockActionType;
                        },
                    },
                },
                provideMockStore({
                    initialState: {},
                    selectors: [
                        {
                            selector: selectApplicationName,
                            value: 'mock-appName',
                        },
                        {
                            selector: selectProcessManagementFilter,
                            value: { id: 'mockId', name: 'mockFilter' },
                        },
                    ],
                }),
                provideMockFeatureFlags({
                    [STUDIO_SHARED.STUDIO_AUTO_OPEN_NEXT_USER_TASK]: true,
                }),
            ],
        });

        fixture = TestBed.createComponent(TaskDetailsCloudExtComponent);
        component = fixture.componentInstance;
        featureService = TestBed.inject(FeaturesServiceToken);
        spyOn(featureService, 'isOn$').and.returnValue(of(true));
        taskCloudService = TestBed.inject(TaskCloudService);
        notificationService = TestBed.inject(NotificationService);
        router = TestBed.inject(Router);
        store = TestBed.inject(MockStore);
        location = TestBed.inject(Location);

        getTaskByIdSpy = spyOn(taskCloudService, 'getTaskById').and.returnValue(of(fakeTaskDetails));
        getCandidateUsersSpy = spyOn(taskCloudService, 'getCandidateUsers').and.returnValue(of([]));
        getCandidateGroupsSpy = spyOn(taskCloudService, 'getCandidateGroups').and.returnValue(of([]));

        fixture.detectChanges();
        mockRouterParams.next({ taskId: '123' });
        component.onTaskDetailsLoaded(fakeTaskDetails);
        fixture.detectChanges();
    });

    it('should get the task by id', () => {
        expect(getTaskByIdSpy).toHaveBeenCalledOnceWith('mock-appName', '123');
    });

    it('should load task empty form', () => {
        const adfCloudForm = fixture.debugElement.nativeElement.querySelector('adf-cloud-form');
        const adfCloudFormTitle = fixture.debugElement.nativeElement.querySelector('adf-empty-content__title');

        expect(adfCloudForm).toBeDefined();
        expect(adfCloudFormTitle).toBeDefined();
    });

    it('should display task filter breadcrumb when navigating from task list', () => {
        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(4);
        expect(breadcrumb[2].textContent).toBe('mockFilter');
        expect(breadcrumb[3].textContent).toBe('task1');
    });

    it('should display process name breadcrumb when navigating from process details', () => {
        mockRouterParams.next({
            taskId: '123',
            processName: 'mock-process-name',
        });
        fixture.detectChanges();

        const breadcrumb = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="breadcrumb-list"] .adf-breadcrumb-item-current');

        expect(breadcrumb.length).toBe(5);
        expect(breadcrumb[3].textContent).toBe('mock-process-name');
    });

    it('should display task details sidebar', () => {
        component.showMetadata = true;
        fixture.detectChanges();

        const adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header'
        );

        expect(adfTaskDetailsCardView).not.toBeNull();
    });

    it('should display task details info icon', () => {
        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');

        expect(adfTaskDetailsInfoIcon).toBeDefined();
    });

    it('should show/hide task details sidebar when clicking info icon', () => {
        let adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-card-view'
        );

        expect(component.showMetadata).toEqual(false);
        expect(adfTaskDetailsCardView).toBeNull();

        const adfTaskDetailsInfoIcon = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-info-drawer-icon"]');
        adfTaskDetailsInfoIcon.click();

        fixture.detectChanges();

        adfTaskDetailsCardView = fixture.debugElement.nativeElement.querySelector(
            'apa-task-details-cloud-metadata adf-info-drawer adf-cloud-task-header'
        );

        expect(adfTaskDetailsCardView).not.toBeNull();
        expect(component.showMetadata).toEqual(true);
    });

    it('should redirect back when clicking cancel task button', () => {
        spyOn(location, 'back');

        fixture.detectChanges();

        const adfTaskDetailsCancelButton = fixture.debugElement.nativeElement.querySelector('#adf-cloud-cancel-task');
        adfTaskDetailsCancelButton.click();

        fixture.detectChanges();

        expect(location.back).toHaveBeenCalled();
    });

    it('should redirect back when clicking close button', async () => {
        spyOn(location, 'back');

        const adfTaskDetailsCancelButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-close-drawer-icon"]');
        adfTaskDetailsCancelButton.click();

        fixture.detectChanges();

        expect(location.back).toHaveBeenCalled();
    });

    it('should navigate to the specific filter when clicking the breadcrumb', () => {
        spyOn(store, 'dispatch');

        fixture.detectChanges();

        const taskFilterBreadcrumb = fixture.debugElement.nativeElement.querySelector('.apa-task-filter-item');
        taskFilterBreadcrumb.dispatchEvent(new MouseEvent('click'));

        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(
            navigateToFilter({
                filterId: 'mockId',
            })
        );
    });

    it('should dispatch navigation redirection when completing the task', () => {
        spyOn(store, 'dispatch').and.callThrough();
        component.currentFilter = null;

        fixture.detectChanges();
        component.onCompleteTaskForm();
        fixture.detectChanges();

        const dispatchedAction = store.dispatch['calls'].argsFor(0);

        expect(dispatchedAction[0]).toEqual(taskCompletedRedirection({ taskId: '123' }));
    });

    it('should open full screen mode when clicking full screen button', () => {
        const switchToDisplayModeSpy = spyOn(component.adfUserTaskCloud, 'switchToDisplayMode');
        fixture.detectChanges();

        const adfTaskDetailsFullScreenButton = fixture.debugElement.nativeElement.querySelector('[data-automation-id="toggle-full-screen-icon"]');
        adfTaskDetailsFullScreenButton.click();

        expect(switchToDisplayModeSpy).toHaveBeenCalledWith('fullScreen');
    });

    describe('Change assignee', () => {
        const openTaskAssignmentAction = (taskId: string, appName: string, assignee: string) =>
            openTaskAssignmentDialog({
                taskId: taskId,
                appName: appName,
                assignee: assignee,
            });

        it('should not open task assignment dialog on click of assignee prop if task is in SUSPENDED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(suspendedTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CANCELLED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(cancelledTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in COMPLETED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(completedTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should not open task assignment dialog on click of assignee prop if task is in CREATED state', () => {
            component.showMetadata = true;
            spyOn(store, 'dispatch');
            getTaskByIdSpy.and.returnValue(of(createdTaskDetailsCloudMock));

            fixture.detectChanges();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-value-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should open task assignment dialog if task is in ASSIGNED state', async () => {
            component.showMetadata = true;
            getTaskByIdSpy.and.returnValue(of(assignedTaskDetailsCloudMock));

            getCandidateUsersSpy.and.returnValue(of(['user-1', 'user-2']));
            getCandidateGroupsSpy.and.returnValue(of(['mock-group-1', 'mock-group-2']));
            spyOn(store, 'dispatch');

            fixture.detectChanges();
            await fixture.whenStable();

            const assignee = fixture.debugElement.query(By.css('[data-automation-id="card-textitem-toggle-assignee"]'));
            assignee.nativeElement.click();

            expect(store.dispatch).toHaveBeenCalledWith(
                openTaskAssignmentAction(assignedTaskDetailsCloudMock.id, assignedTaskDetailsCloudMock.appName, assignedTaskDetailsCloudMock.assignee)
            );
        });

        it('should dispatch an action when the component gets initialized', () => {
            const actionDispatchSpy = spyOn(store, 'dispatch');
            component.ngOnInit();

            expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
        });

        it('should dispatch an action when the component gets destroyed', () => {
            const actionDispatchSpy = spyOn(store, 'dispatch');
            component.ngOnDestroy();

            expect(actionDispatchSpy).toHaveBeenCalledWith(mockActionType);
        });

        it('should navigate on click of file content', () => {
            const taskId = '123';
            const mockNodeId = 'mock-node-id';
            const routerSpy = spyOn(router, 'navigate');
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(routerSpy).toHaveBeenCalledWith([
                `task-details-cloud/${taskId}`,
                {
                    outlets: {
                        viewer: ['preview', mockNodeId],
                    },
                },
            ]);
        });

        it('should include processName in the route url if the processName defined', () => {
            const taskId = '123';
            const processName = 'mock-process-name';
            const mockNodeId = 'mock-node-id';
            const routerSpy = spyOn(router, 'navigate');
            component.processName = processName;
            component.onFormContentClicked({ nodeId: 'mock-node-id' });

            expect(routerSpy).toHaveBeenCalledWith([
                `task-details-cloud/${taskId}/${processName}`,
                {
                    outlets: {
                        viewer: ['preview', mockNodeId],
                    },
                },
            ]);
        });
    });

    describe('error handling', () => {
        const message = 'Failed to complete the task';

        it('should show error message on api fail when error is a string', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(message);
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is an object', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(JSON.stringify({ message }));
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is a nested object', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(JSON.stringify({ entry: { message } }));
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(message);
        });

        it('should show error message on api fail when error is a duplicate correlation key', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    status: 409,
                    message: 'Duplicate message subscription test with correlation key test',
                })
            );
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.DUPLICATE_CORRELATION_KEY');
        });

        it('should show error message on api fail when error is unauthorized access', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    entry: {
                        code: 403,
                        message: 'Operation not permitted for task-uuid',
                    },
                })
            );

            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.UNAUTHORIZED');
        });

        it('should show all the error messages as comma separated when there are list of errors', () => {
            const showErrorSpy = spyOn(notificationService, 'showError');
            const error = new Error(
                JSON.stringify({
                    errors: [
                        {
                            message: 'Textfield-1 is a required field and has to have some value',
                        },
                        {
                            message: 'Dropdown-123 is a required field and has to have some value',
                        },
                    ],
                })
            );
            component.onError(error);

            expect(showErrorSpy).toHaveBeenCalledWith(
                'Textfield-1 is a required field and has to have some value, Dropdown-123 is a required field and has to have some value'
            );
        });
    });

    describe('onExecuteOutcome', () => {
        it('should show info notification when custom outcome button is clicked', () => {
            const showInfoSpy = spyOn(notificationService, 'showInfo');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, {
                id: 'custom1',
                name: outcomeName,
            });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(showInfoSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION', undefined, { outcome: 'Custom Action' });
        });

        it('should NOT dispatch snackbar notification when a system button is clicked', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const formModel = new FormModel();
            const outcomeName = 'Custom Action';
            const outcome = new FormOutcomeModel(formModel, {
                id: 'custom1',
                name: outcomeName,
                isSystem: true,
            });
            const formOutcomeEvent = new FormOutcomeEvent(outcome);

            component.onExecuteOutcome(formOutcomeEvent);

            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });
});
