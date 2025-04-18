/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService, NotificationService, NoopTranslateModule, NoopAuthModule, AdfDateFnsAdapter } from '@alfresco/adf-core';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import {
    TaskFilterCloudService,
    TaskCloudModule,
    TaskCloudService,
    ProcessDefinitionCloud,
    TASK_FILTERS_SERVICE_TOKEN,
    LocalPreferenceCloudService,
    ApplicationInstanceModel,
    TaskFilterCloudModel,
    TASK_LIST_CLOUD_TOKEN,
    NotificationCloudService,
    TaskFilterAction,
} from '@alfresco/adf-process-services-cloud';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { fakeTaskCloudDatatableSchema, fakeTaskCloudList } from '../../mock/task-list.mock';
import { fakeEditTaskFilter, fakeTaskCloudFilters, fakeTaskFilter, fakeTaskFilters } from '../../mock/task-filter.mock';
import { TaskListCloudContainerExtComponent } from './task-list-cloud-container-ext.component';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import { TaskListCloudServiceInterface } from '@alfresco/adf-process-services-cloud/lib/services/task-list-cloud.service.interface';
import { selectProcessDefinitionsVariableColumnsSchema } from '../../../../store/selectors/datatable-columns-schema.selector';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { FormFieldHarnessUtils, SelectHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MockProvider } from 'ng-mocks';
import { TaskFilterService } from '../../services/task-filters/task-filter.service';
import { StringFilter } from '@alfresco-dbp/shared-filters-services';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { STUDIO_SHARED } from '@features';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProcessFilterFeatureFlagService } from '../../../../services/process-filters.feature-flag.service';
import { DateAdapter } from '@angular/material/core';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

describe('TaskListCloudContainerExtComponent', () => {
    let fixture: ComponentFixture<TaskListCloudContainerExtComponent>;
    let taskFilterCloudService: TaskFilterCloudService;
    let component: TaskListCloudContainerExtComponent;
    let taskCloudListService: TaskListCloudServiceInterface;
    let alfrescoApiService: AlfrescoApiService;
    let taskCloudService: TaskCloudService;
    let getTaskFilterByIdSpy: jasmine.Spy;
    let getTaskListFiltersSpy: jasmine.Spy;
    let appConfig: AppConfigService;
    let store: MockStore<any>;
    let notificationService: NotificationService;
    let loader: HarnessLoader;
    let taskFilterService: TaskFilterService;

    const activatedRoute = {
        queryParams: new BehaviorSubject<any>({ filterId: '123' }),
    };

    const fakeApplicationInstance: ApplicationInstanceModel[] = [
        { name: 'application-new-1', createdAt: '2018-09-21T12:31:39.000Z', status: 'Deployed', theme: 'theme-2', icon: 'favorite_border' },
        { name: 'application-new-2', createdAt: '2018-09-21T12:31:39.000Z', status: 'Pending', theme: 'theme-2', icon: 'favorite_border' },
        { name: 'application-new-3', createdAt: '2018-09-21T12:31:39.000Z', status: 'Pending' },
    ];

    const mock = {
        oauth2Auth: {
            callCustomApi: () => Promise.resolve(fakeApplicationInstance),
        },
    };

    const processDefinitions = [
        new ProcessDefinitionCloud({
            appName: 'myApp',
            appVersion: 0,
            id: 'NewProcess:1',
            name: 'process1',
            key: 'process-12345-f992-4ee6-9742-3a04617469fe',
            formKey: 'mockFormKey',
            category: 'fakeCategory',
            description: 'fakeDesc',
        }),
    ];

    const fakeStringFilter = new StringFilter({
        name: 'fakeFilter',
        translationKey: 'fakeFilter',
        value: ['fakeValue'],
        visible: true,
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopTranslateModule,
                NoopAnimationsModule,
                NoopAuthModule,
                TaskCloudModule,
                MatSnackBarModule,
                TaskListCloudContainerExtComponent,
            ],
            providers: [
                { provide: DateAdapter, useClass: AdfDateFnsAdapter },
                { provide: TASK_FILTERS_SERVICE_TOKEN, useClass: LocalPreferenceCloudService },
                { provide: NotificationCloudService, useValue: {} },
                {
                    provide: ActivatedRoute,
                    useValue: activatedRoute,
                },
                provideMockFeatureFlags({ [STUDIO_SHARED.STUDIO_AUTO_OPEN_NEXT_USER_TASK]: true }),
                provideMockStore({
                    initialState: {},
                    selectors: [
                        { selector: selectApplicationName, value: 'mock-appName' },
                        { selector: selectProcessDefinitionsLoaderIndicator, value: true },
                        { selector: selectProcessDefinitionsVariableColumnsSchema, value: [] },
                        { selector: selectIfCurrentFilterCanBeRefreshed, value: false },
                    ],
                }),
                MockProvider(TaskFilterService, {
                    getFilters: () => of([fakeStringFilter]),
                    isDefaultFilter: () => true,
                    saveFilter: () => of([fakeTaskFilter]),
                    saveFilterAs: () => of([fakeTaskFilter]),
                    deleteFilter: () => of(fakeTaskFilters),
                    filterArrayToTaskFilterCloud: () => fakeTaskFilter,
                }),
                MockProvider(ProcessFilterFeatureFlagService, {
                    showNewFilters: () => of(false),
                }),
            ],
        });

        fixture = TestBed.createComponent(TaskListCloudContainerExtComponent);
        component = fixture.componentInstance;
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = Object.assign(appConfig.config, fakeTaskCloudDatatableSchema);
        appConfig.config = Object.assign(appConfig.config, fakeEditTaskFilter);
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        taskFilterCloudService = TestBed.inject(TaskFilterCloudService);
        taskCloudListService = TestBed.inject(TASK_LIST_CLOUD_TOKEN);
        taskCloudService = TestBed.inject(TaskCloudService);
        store = TestBed.inject(MockStore);
        notificationService = TestBed.inject(NotificationService);
        loader = TestbedHarnessEnvironment.loader(fixture);
        taskFilterService = TestBed.inject(TaskFilterService);

        spyOn(alfrescoApiService, 'getInstance').and.returnValue(<any>mock);
        getTaskFilterByIdSpy = spyOn(taskFilterCloudService, 'getTaskFilterById').and.returnValue(of(fakeTaskFilter));
        getTaskListFiltersSpy = spyOn(taskFilterCloudService, 'getTaskListFilters').and.returnValue(of(fakeTaskCloudFilters));
        spyOn(taskCloudListService, 'getTaskByRequest').and.returnValue(of(fakeTaskCloudList));
        spyOn(taskCloudService, 'getProcessDefinitions').and.returnValue(of(processDefinitions));
    });

    describe('When filterId is absent from the route queryParams', () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({});
            fixture.detectChanges();
        });

        it('Should get the first available filter', () => {
            expect(getTaskListFiltersSpy).toHaveBeenCalledWith('mock-appName');
            expect(component.taskFilter.id).toEqual(fakeTaskCloudFilters[0].id);
        });
    });

    describe('When filterId is present in the route queryParams', () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({ filterId: 'mock-id' });
            fixture.detectChanges();
        });

        it('Should get params from routing', () => {
            expect(getTaskFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'mock-id');
            expect(component.taskFilter.id).toEqual(fakeTaskFilter.id);
        });
    });

    it('should get edit task filters default properties', () => {
        fixture.detectChanges();
        expect(component.taskFilterProperties.filterProperties.length).toBeGreaterThan(0);
        expect(component.taskFilterProperties.sortProperties.length).toBeGreaterThan(0);
        expect(component.taskFilterProperties.actions.length).toBeGreaterThan(0);
    });

    describe(`When ${STUDIO_SHARED.STUDIO_FILTERS_REDESIGN} is on`, () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({});
            fixture.detectChanges();
            const featureService = TestBed.inject(ProcessFilterFeatureFlagService);
            spyOn(featureService, 'showNewFilters').and.returnValue(of(true));
        });

        it('should get filters', () => {
            expect(component.filters).toEqual([fakeStringFilter]);
        });

        it('should render hxp-filters-container', () => {
            const filtersContainer = fixture.debugElement.query(By.css('hxp-filters-container'));
            expect(filtersContainer).toBeDefined();
        });

        it('should update the task list pagination on filters change', () => {
            const paginationSpy = spyOn(component.taskListExtCloudComponent, 'fetchCloudPaginationPreference');

            component.onFiltersChange([]);
            fixture.detectChanges();

            expect(paginationSpy).toHaveBeenCalled();
        });

        it('should save filter, show notification and navigate to filter on filter save', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const saveFilterSpy = spyOn(taskFilterService, 'saveFilter').and.returnValue(of([fakeTaskFilter]));

            component.onFilterSave();

            expect(saveFilterSpy).toHaveBeenCalledWith(component.taskFilter);
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: component.taskFilter.id,
                })
            );
        });

        it('should add filter, show notification and navigate to filter on filter save as', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const saveFilterAsSpy = spyOn(taskFilterService, 'saveFilterAs').and.returnValue(of([fakeTaskFilter]));

            component.onFilterSaveAs('mock-name');

            expect(saveFilterAsSpy).toHaveBeenCalledWith(component.taskFilter, 'mock-name');
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: component.taskFilter.id,
                })
            );
        });

        it('should delete filter, show notification and navigate to first filter on filter delete', () => {
            const storeDispatchSpy = spyOn(store, 'dispatch');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const deleteFilterSpy = spyOn(taskFilterService, 'deleteFilter').and.returnValue(of(fakeTaskFilters));

            component.onFilterDelete();

            expect(deleteFilterSpy).toHaveBeenCalledWith(component.taskFilter);
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
            expect(storeDispatchSpy).toHaveBeenCalledWith(
                navigateToFilter({
                    filterId: fakeTaskFilters[0].id,
                })
            );
        });
    });

    describe(`When ${STUDIO_SHARED.STUDIO_FILTERS_REDESIGN} is off`, () => {
        beforeEach(() => {
            activatedRoute.queryParams = new BehaviorSubject<any>({});
            fixture.detectChanges();
        });

        it('should display taskName filter if it is in the config file', () => {
            const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll(
                '[data-automation-id="adf-cloud-edit-task-property-taskName"]'
            );
            expect(taskNameFilter).not.toBeNull();
        });

        it('should display task priority filter if it is in the config file', () => {
            const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll(
                '[data-automation-id="adf-cloud-edit-task-property-priority"]'
            );
            expect(taskNameFilter).toBeTruthy();
        });

        it('should display process definition name filter if it is in the config file', () => {
            const taskNameFilter = fixture.debugElement.nativeElement.querySelector(
                '[data-automation-id="adf-cloud-edit-task-property-processDefinitionName"]'
            );
            expect(taskNameFilter).toBeTruthy();
        });

        it('should display process definition option when process definition dropdown is selected', async () => {
            const options = await SelectHarnessUtils.getDropdownOptions({
                fixture,
                dropdownFilters: { selector: '[data-automation-id="adf-cloud-edit-task-property-processDefinitionName"]' },
            });
            expect(options.length).toBeGreaterThan(0);
            expect(options[0]).toContain('ADF_CLOUD_TASK_FILTERS.STATUS.ALL');
            expect(options[1]).toContain(processDefinitions[0].name);
        });

        it('should display dueDate filter if it is in the config file', () => {
            const taskNameFilter = fixture.debugElement.nativeElement.querySelectorAll(
                '[data-automation-id="adf-cloud-edit-process-property-dueDate"]'
            );
            expect(taskNameFilter).toBeTruthy();
        });

        it('should display completedBy filter if is present in the config', async () => {
            const completedByInput = await FormFieldHarnessUtils.getFormField({
                fixture,
                formFieldFilters: {
                    selector: '.adf-people-cloud',
                },
            });

            expect(await completedByInput.getLabel()).toEqual('ADF_CLOUD_EDIT_TASK_FILTER.LABEL.COMPLETED_BY');
        });

        it('should display assignment filter if is present in the config', () => {
            const assignmentElement = fixture.debugElement.query(By.css('adf-cloud-task-assignment-filter'));
            expect(assignmentElement).toBeDefined();
            expect(assignmentElement).not.toBeNull();
        });

        it('should display status filter if it is in the config file', () => {
            const statusFilter = fixture.debugElement.nativeElement.querySelectorAll('[data-automation-id="adf-cloud-edit-task-property-status"]');
            expect(statusFilter).toBeTruthy();
        });

        it('should update the task list pagination on filter change', () => {
            const paginationSpy = spyOn(component.taskListExtCloudComponent, 'fetchCloudPaginationPreference');
            component.onFilterChange(<TaskFilterCloudModel>{ id: 'filter-id' });
            fixture.detectChanges();
            expect(paginationSpy).toHaveBeenCalled();
        });
    });

    describe('Router Query params', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('Should able to call getTaskFilterById to get filter details on router params change', () => {
            spyOn(store, 'dispatch');
            activatedRoute.queryParams.next({ filterId: 'new-filter-id' });
            fixture.detectChanges();

            expect(getTaskFilterByIdSpy).toHaveBeenCalledWith('mock-appName', 'new-filter-id');
        });

        it('Should able to dispatch setProcessManagementFilter action on router params change', () => {
            spyOn(store, 'dispatch');
            activatedRoute.queryParams.next({ filterId: 'new-filter-id' });
            fixture.detectChanges();

            expect(store.dispatch).toHaveBeenCalledWith(
                setProcessManagementFilter({
                    payload: {
                        type: FilterType.TASK,
                        filter: fakeTaskFilter,
                    },
                })
            );
        });
    });

    describe('Edit filter actions', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('Should be able to dispatch navigateToFilter action on filter delete', () => {
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.onTaskFilterAction(<TaskFilterAction>{ actionType: 'delete', filter: fakeTaskCloudFilters[0] });
            fixture.detectChanges();

            expect(getTaskListFiltersSpy).toHaveBeenCalled();
            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToFilter({ filterId: fakeTaskCloudFilters[0].id }));
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
        });

        it('Should be able to dispatch navigateToFilter action on filter Save/SaveAs', () => {
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            const storeDispatchSpy = spyOn(store, 'dispatch');

            component.onTaskFilterAction(<TaskFilterAction>{ actionType: 'saveAs', filter: fakeTaskCloudFilters[0] });
            fixture.detectChanges();

            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToFilter({ filterId: fakeTaskCloudFilters[0].id }));
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');

            component.onTaskFilterAction(<TaskFilterAction>{ actionType: 'save', filter: fakeTaskCloudFilters[0] });
            fixture.detectChanges();

            expect(storeDispatchSpy).toHaveBeenCalledWith(navigateToFilter({ filterId: fakeTaskCloudFilters[0].id }));
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
        });
    });

    describe('Refresh List button', () => {
        beforeEach(() => {
            component.taskFilter = fakeTaskFilter;
            fixture.detectChanges();
        });

        it('should allow the user to refresh the list any time', async () => {
            component.taskFilter.key = 'test-filter-1';
            component.taskFilter.name = 'ADF_CLOUD_TASK_FILTERS.MY_TASKS';
            spyOn(store, 'dispatch').and.callThrough();
            const actionTaskOrProcessFilterUpdate = taskOrProcessFilterUpdate({ filterKey: component.taskFilter.key, canBeRefreshed: false });
            const refreshFilterSpy = spyOn(taskFilterCloudService, 'refreshFilter');
            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.taskListExtCloudComponent, 'reload');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, false);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).not.toHaveBeenCalled();

            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, true);
            store.refreshState();
            fixture.detectChanges();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(actionTaskOrProcessFilterUpdate);
            expect(refreshFilterSpy).toHaveBeenCalled();
        });

        it('should notify the user that the list is up to date if there is no change', async () => {
            component.taskFilter.key = 'test-filter-1';
            component.taskFilter.name = 'ADF_CLOUD_TASK_FILTERS.MY_TASKS';
            spyOn(store, 'dispatch').and.callThrough();

            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.taskListExtCloudComponent, 'reload');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, false);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).not.toHaveBeenCalled();
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        });

        it('should notify the user that the list is refreshed when there is a notification and synchronization is needed', async () => {
            component.taskFilter.key = 'test-filter-1';
            component.taskFilter.name = 'ADF_CLOUD_TASK_FILTERS.MY_TASKS';
            spyOn(store, 'dispatch').and.callThrough();

            const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.app-refresh-action-button' }));
            const taskListExtCloudComponentSpy = spyOn(component.taskListExtCloudComponent, 'reload');
            const notificationServiceSpy = spyOn(notificationService, 'showInfo');
            store.overrideSelector(selectIfCurrentFilterCanBeRefreshed, true);
            store.refreshState();
            fixture.detectChanges();

            expect(buttonHarness).toBeDefined();
            expect(await buttonHarness.isDisabled()).toBe(false);
            await buttonHarness.click();
            expect(taskListExtCloudComponentSpy).toHaveBeenCalled();
            expect(notificationServiceSpy).toHaveBeenCalledWith('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        });
    });
});
