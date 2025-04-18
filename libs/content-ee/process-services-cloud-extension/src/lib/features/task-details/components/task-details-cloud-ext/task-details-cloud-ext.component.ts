/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, OnDestroy, ViewEncapsulation, Inject, Optional, ViewChild } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { TaskDetailsCloudModel, FilterParamsModel, UserTaskCloudComponent } from '@alfresco/adf-process-services-cloud';
import { navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { CardViewUpdateService, ClickNotification, FormOutcomeEvent, NotificationService, ToolbarDividerComponent } from '@alfresco/adf-core';
import { DialogService } from '../../../../services/dialog.service';
import { openTaskAssignmentDialog, taskCompletedRedirection } from '../../../../store/actions/task-details.actions';
import { TaskAssigneeModel } from '../../models/task-assignee.model';
import { navigateToProcessDetails } from '../../../../store/actions/process-list-cloud.actions';
import { STORE_ACTIONS_PROVIDER, StoreActions } from '../../../../services/process-services-cloud-extension-actions.provider';
import { FORM_DISPLAY_MODES } from '../../../shared/form-display-mode';
import { TaskDetailsCloudMetadataComponent } from '../task-details-cloud-metadata/task-details-cloud-metadata.component';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { PrintDirective } from '../../../../directives/print/print.directive';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';

@Component({
    standalone: true,
    imports: [
        TaskDetailsCloudMetadataComponent,
        NgIf,
        UserTaskCloudComponent,
        PageLayoutContentComponent,
        TranslateModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        PrintDirective,
        ToolbarDividerComponent,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
    ],
    selector: 'apa-task-details-cloud-ext',
    templateUrl: './task-details-cloud-ext.component.html',
    styleUrls: ['./task-details-cloud-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TaskDetailsCloudExtComponent implements OnInit, OnDestroy {
    static COMPLETED_TASK = 'completed-tasks';
    @ViewChild(UserTaskCloudComponent, { static: true })
    adfUserTaskCloud: UserTaskCloudComponent;
    appName: string;
    processName: string;
    onDestroy$ = new Subject<void>();
    taskDetails$: Observable<TaskDetailsCloudModel>;
    currentFilter: FilterParamsModel;
    showMetadata = false;
    taskId: string;
    taskDetails: TaskDetailsCloudModel;
    displayConfigurations = FORM_DISPLAY_MODES;
    showNextTaskCheckbox: boolean;
    isNextTaskCheckboxChecked: boolean;

    private taskDetailSubject = new Subject<TaskDetailsCloudModel>();

    constructor(
        private readonly store: Store<any>,
        private readonly location: Location,
        private readonly route: ActivatedRoute,
        public readonly dialogService: DialogService,
        private readonly cardViewUpdateService: CardViewUpdateService,
        @Optional()
        @Inject(STORE_ACTIONS_PROVIDER)
        private readonly storeActions: StoreActions,
        private readonly notificationService: NotificationService,
        private readonly router: Router,
        @Inject(FeaturesServiceToken)
        private readonly featuresService: IFeaturesService
    ) {
        this.taskDetails$ = this.taskDetailSubject.asObservable();
        this.setupFeatureFlags();
    }

    private setupFeatureFlags() {
        this.featuresService
            .isOn$(STUDIO_SHARED.STUDIO_AUTO_OPEN_NEXT_USER_TASK)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((enabled) => {
                this.showNextTaskCheckbox = enabled;
                this.isNextTaskCheckboxChecked = enabled;
            });
    }

    ngOnInit(): void {
        this.setFileUploadingDialogVisibility(false);
        this.route.params
            .pipe(withLatestFrom(this.store.select(selectApplicationName)), takeUntil(this.onDestroy$))
            .subscribe(([params, appName]) => {
                this.appName = appName;
                this.processName = params['processName'];
                this.taskId = params['taskId'];
            });
        this.store
            .select(selectProcessManagementFilter)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((filter: FilterParamsModel) => {
                this.currentFilter = filter;
            });
        this.taskDetails$.pipe(takeUntil(this.onDestroy$)).subscribe((taskDetail) => (this.taskDetails = taskDetail));
        this.cardViewUpdateService.itemClicked$.pipe(takeUntil(this.onDestroy$)).subscribe(this.clickTaskDetails.bind(this));
    }

    onCompleteTaskForm() {
        this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED');
        this.store.dispatch(taskCompletedRedirection({ taskId: this.taskId }));
    }

    onTaskDetailsLoaded(taskDetails) {
        this.taskDetailSubject.next(taskDetails);
    }

    onFormSaved() {
        this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_SAVED');
    }

    onExecuteOutcome({ outcome }: FormOutcomeEvent) {
        if (!outcome.isSystem) {
            this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION', undefined, { outcome: outcome.name });
        }
    }

    navigateToSelectedFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    onCancelForm() {
        this.navigateBack();
    }

    onFilterClick() {
        this.store.dispatch(
            navigateToFilter({
                filterId: this.currentFilter.id,
            })
        );
    }

    onFormContentClicked({ nodeId }) {
        let pluginRoute = `task-details-cloud/${this.taskId}`;
        if (this.processName) {
            pluginRoute = `task-details-cloud/${this.taskId}/${this.processName}`;
        }

        void this.router.navigate([
            pluginRoute,
            {
                outlets: {
                    viewer: ['preview', nodeId],
                },
            },
        ]);
    }

    onError({ message: error }: Error) {
        let errorPayload;
        try {
            errorPayload = JSON.parse(error);
        } catch {}

        this.handleErrorMessage(errorPayload || error);
    }

    onFullScreen() {
        if (this.adfUserTaskCloud) {
            this.adfUserTaskCloud.switchToDisplayMode('fullScreen');
        }
    }

    handleErrorMessage(errorPayload: unknown) {
        const duplicationSubstring = 'Duplicate message subscription';
        const unauthorizedSubstring = 'Operation not permitted for';
        if (errorPayload?.['status'] === 409 && errorPayload?.['message']?.includes(duplicationSubstring)) {
            return this.notificationService.showError('PROCESS_CLOUD_EXTENSION.TASK_FORM.DUPLICATE_CORRELATION_KEY');
        } else if (errorPayload?.['entry']?.code === 403 && errorPayload?.['entry']?.message?.includes(unauthorizedSubstring)) {
            this.onCancelForm();
            return this.notificationService.showError('PROCESS_CLOUD_EXTENSION.TASK_FORM.UNAUTHORIZED');
        } else if (errorPayload?.['errors'] && Array.isArray(errorPayload?.['errors'])) {
            const errorMessages = errorPayload?.['errors'].map((errorDetails) => errorDetails?.message);
            return this.notificationService.showError(errorMessages.join(', '));
        } else {
            const errorMessage = errorPayload?.['message'] || errorPayload?.['entry']?.message || errorPayload;
            return this.notificationService.showError(errorMessage);
        }
    }

    ngOnDestroy() {
        this.setFileUploadingDialogVisibility(true);
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private navigateBack() {
        this.location.back();
    }

    private clickTaskDetails(clickNotification: ClickNotification) {
        if (clickNotification.target.key === 'assignee') {
            this.openDialog(clickNotification.target.value);
        }
        if (clickNotification.target.key === 'processInstanceId') {
            this.navigateToProcessDetails(clickNotification.target.value);
        }
    }

    private openDialog(assignee: string) {
        this.store.dispatch(
            openTaskAssignmentDialog(<TaskAssigneeModel>{
                taskId: this.taskId,
                appName: this.appName,
                assignee: assignee,
            })
        );
    }

    private navigateToProcessDetails(processInstanceId: string) {
        this.store.dispatch(
            navigateToProcessDetails({
                processInstanceId,
            })
        );
    }

    private setFileUploadingDialogVisibility(visibility: boolean) {
        if (this.storeActions) {
            const uploadDialogVisibilityAction = visibility
                ? this.storeActions.getOnDestroyAction(visibility)
                : this.storeActions.getOnInitAction(visibility);
            this.store.dispatch(uploadDialogVisibilityAction);
        }
    }

    onNextTaskCheckboxCheckedChanged(event: MatCheckboxChange) {
        this.isNextTaskCheckboxChecked = event.checked;
    }
}
