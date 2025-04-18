/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormModel } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomModeledExtensionTestingModule } from '../../testing/custom-modeled-extension-testing.module';
import { FormActionDialogComponent, FormActionDialogData } from './form-action-dialog.component';
import { Store } from '@ngrx/store';
import { selectApplicationName } from '../../store/selectors/extension.selectors';
import { of } from 'rxjs';
import { createProcessInstance, submitForm } from '../../store/actions/extension.actions';

describe('FormActionDialogComponent', () => {
    let component: FormActionDialogComponent;
    let fixture: ComponentFixture<FormActionDialogComponent>;
    let store: Store<any>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    const mockDialogData: FormActionDialogData = {
        formDefinitionId: 'mockFormDefinitionId',
        appName: 'mockApp',
        nodes: [],
        processDefinitionKey: 'mockProcessDefinitionKey',
        processDefinitionName: 'mockProcessDefinitionName',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CustomModeledExtensionTestingModule, FormActionDialogComponent],
            declarations: [],
            providers: [
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            if (selector === selectApplicationName) {
                                return of('mockApp');
                            } else {
                                return of({});
                            }
                        },
                        dispatch: () => {},
                    },
                },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
        });

        fixture = TestBed.createComponent(FormActionDialogComponent);
        store = TestBed.inject(Store);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component.data = mockDialogData;
    });

    it('should dispatch createProcessInstance action when submitting a form with processDefinitionKey', () => {
        const createProcessInstanceSpy = spyOn(store, 'dispatch');
        const values = {
            values: { mockField: 'mockValue' },
        } as unknown as FormModel;
        component.formCloud = values;
        component.data.processDefinitionKey = 'mockProcessDefinitionKey';
        const expectedValue = createProcessInstance({
            processDefinitionKey: 'mockProcessDefinitionKey',
            processDefinitionName: 'mockProcessDefinitionName',
            variables: values.values,
        });
        component.submitForm();
        expect(createProcessInstanceSpy).toHaveBeenCalledWith(expectedValue);
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should dispatch submitForm action when submitting a form with no processDefinitionKey', () => {
        const submitFormSpy = spyOn(store, 'dispatch');
        const values = {
            values: { mockField: 'mockValue' },
        } as unknown as FormModel;
        component.formCloud = values;
        component.data.processDefinitionKey = undefined;
        const expectedValue = submitForm({
            formDefinitionId: 'mockFormDefinitionId',
            variables: values.values,
        });
        component.submitForm();
        expect(submitFormSpy).toHaveBeenCalledWith(expectedValue);
        expect(mockDialogRef.close).toHaveBeenCalled();
    });
});
