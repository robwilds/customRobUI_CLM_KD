/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { createProcessInstance, submitForm } from '../../store/actions/extension.actions';
import { selectApplicationName } from '../../store/selectors/extension.selectors';
import { FormModel } from '@alfresco/adf-core';
import { Node, NodeEntry } from '@alfresco/js-api';
import { FormActionDialogService, UploadWidget } from '../../services/form-action-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormCloudComponent, FormCustomOutcomesComponent } from '@alfresco/adf-process-services-cloud';

export interface FormActionDialogData {
    formDefinitionId: string;
    appName: string;
    nodes: NodeEntry[];
    processDefinitionKey?: string;
    processDefinitionName?: string;
}

export interface UploadWidgetValue {
    name: string;
    value: Node[];
}

@Component({
    standalone: true,
    imports: [TranslateModule, UpperCasePipe, MatButtonModule, MatDialogModule, FormCustomOutcomesComponent, FormCloudComponent, NgTemplateOutlet],
    selector: 'ama-form-action-dialog',
    templateUrl: './form-action-dialog.component.html',
    styleUrls: ['./form-action-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FormActionDialogComponent {
    isFormCloudLoaded = false;
    formCloud: FormModel;
    isLoading = false;
    appName$: Observable<string>;
    values: UploadWidgetValue[];

    constructor(
        private dialogRef: MatDialogRef<FormActionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FormActionDialogData,
        private store: Store<any>,
        private service: FormActionDialogService
    ) {
        this.appName$ = this.store.select(selectApplicationName);
    }

    onFormLoaded(form: FormModel) {
        this.isFormCloudLoaded = true;
        this.formCloud = form;
        if (!this.values && this.data.nodes && this.data.nodes.length > 0) {
            const uploadWidgets = this.service.getUploadWidgetFields(this.formCloud.getFormFields());
            this.values = this.prepareFormValues(
                uploadWidgets,
                this.data.nodes.map((node) => node.entry)
            );
        }
    }

    isFormValid(): boolean {
        if (this.data?.formDefinitionId && this.isFormCloudLoaded) {
            return this.formCloud.isValid && !this.isLoading;
        } else {
            return false;
        }
    }

    submitForm() {
        if (this.data.processDefinitionKey) {
            this.store.dispatch(
                createProcessInstance({
                    processDefinitionKey: this.data.processDefinitionKey,
                    processDefinitionName: this.data.processDefinitionName,
                    variables: this.formCloud.values,
                })
            );
        } else {
            this.store.dispatch(
                submitForm({
                    formDefinitionId: this.data.formDefinitionId,
                    variables: this.formCloud.values,
                })
            );
        }
        this.dialogRef.close();
    }

    private prepareFormValues(contentWidgets: UploadWidget[], selectedNodes: Node[]): UploadWidgetValue[] {
        const values: UploadWidgetValue[] = [];
        const firstSimpleWidget = contentWidgets.find(({ type }) => type === 'single');
        const firstMultipleWidget = contentWidgets.find(({ type }) => type === 'multiple');

        if (selectedNodes.length === 1 && (firstSimpleWidget || firstMultipleWidget)) {
            values.push({
                name: (firstSimpleWidget || firstMultipleWidget).id,
                value: selectedNodes,
            });
        } else if (selectedNodes.length > 1 && firstMultipleWidget) {
            values.push({
                name: firstMultipleWidget.id,
                value: selectedNodes,
            });
        }

        return values;
    }
}
