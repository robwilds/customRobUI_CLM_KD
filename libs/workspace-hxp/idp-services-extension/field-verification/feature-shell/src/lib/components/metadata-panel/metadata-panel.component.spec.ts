/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataPanelComponent } from './metadata-panel.component';
import { By } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActionHistoryService, ActionLinearHistoryService } from '../../services/action-history.service';
import { IdpVerificationService } from '../../services/verification/verification.service';
import { IdpDocumentPage, IdpField } from '../../models/screen-models';
import { IdpContextTaskBaseService, IdpVerificationStatus, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { documentState, fieldVerificationRootState } from '../../store/shared-mock-states';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { selectDocument } from '../../store/selectors/document.selectors';
import { FieldVerificationContextTaskService } from '../../services/context-task/field-verification-context-task.service';
import { of } from 'rxjs';

describe('MetadataPanelComponent', () => {
    let component: MetadataPanelComponent;
    let fixture: ComponentFixture<MetadataPanelComponent>;
    let fields: IdpField[];
    let store: MockStore;
    let idpVerificationService: IdpVerificationService;

    const updatedFieldValue = 'Updated Field Value 1';

    const mockField1: IdpField = {
        id: '1',
        name: 'Field 1',
        value: 'Value 1',
        dataType: 'Alphanumeric',
        verificationStatus: IdpVerificationStatus.ManualValid,
        hasIssue: true,
        confidence: 0.55,
        format: 'string',
        isSelected: false,
    };

    const mockField2: IdpField = {
        id: '2',
        name: 'Field 2',
        value: 'Value 2',
        dataType: 'Alphanumeric',
        verificationStatus: IdpVerificationStatus.AutoInvalid,
        hasIssue: false,
        confidence: 0.95,
        format: 'string',
        isSelected: false,
    };

    const mockField3: IdpField = {
        id: '3',
        name: 'Field 3',
        value: 'Value 3',
        dataType: 'Alphanumeric',
        verificationStatus: IdpVerificationStatus.AutoInvalid,
        hasIssue: true,
        confidence: 0.55,
        format: 'string',
        isSelected: true,
    };

    beforeEach(() => {
        const idpContextTaskBaseServiceSpy = jasmine.createSpyObj('IdpContextTaskBaseService', ['rejectReasons$']);
        idpContextTaskBaseServiceSpy.rejectReasons$ = of([]);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, MetadataPanelComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                { provide: ActionHistoryService, useClass: ActionLinearHistoryService },
                provideMockStore({ initialState: fieldVerificationRootState }),
                IdpVerificationService,
                FieldVerificationContextTaskService,
                { provide: IdpContextTaskBaseService, useValue: idpContextTaskBaseServiceSpy },
            ],
        });

        store = TestBed.inject(MockStore);
        fixture = TestBed.createComponent(MetadataPanelComponent);
        idpVerificationService = TestBed.inject(IdpVerificationService);

        fields = [mockField1, mockField2, mockField3];
        store.overrideSelector(selectDocument, {
            ...documentState,
            fields: fields,
            hasIssue: false,
            pages: documentState.pages.map(
                (page) =>
                    ({
                        ...page,
                        documentId: documentState.id,
                        hasIssue: false,
                        isSelected: false,
                    } as IdpDocumentPage)
            ),
        });

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    function findFieldInputDebugElement(field: IdpField) {
        return fixture.debugElement.query(By.css(`input[id=${CSS.escape(field.id)}]`));
    }

    function simulateFieldInput(input: HTMLInputElement, value: string) {
        input.dispatchEvent(new Event('focus'));
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('focusout'));
    }

    function getFieldValue(field: IdpField) {
        const fieldInput = findFieldInputDebugElement(field)?.nativeElement;
        return fieldInput.value as string | undefined;
    }

    function updatePanelField(field: IdpField, value: string) {
        const fieldInput = findFieldInputDebugElement(field)?.nativeElement;
        simulateFieldInput(fieldInput, value);
    }

    it('should display metadata fields', async () => {
        const fieldElements = fixture.debugElement.queryAll(By.css('.idp-form-field'));
        expect(fieldElements.length).toBe(fields.length);
        for (const [index, field] of fieldElements.entries()) {
            const expectedField = fields[index];
            const labelElement = field.query(By.css('.idp-form-field-label'));
            expect(labelElement.nativeElement.textContent).toEqual(expectedField.name);
            const inputElement = field.query(By.css('.idp-form-field-input'));
            expect(inputElement.nativeElement.value).toEqual(expectedField.value);
        }
    });

    it('should display report issue dialog', () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.openRejectDocumentDialog();
        expect(component.dialog.open).toHaveBeenCalled();
    });

    it('should update extraction result using IdpVerificationService', () => {
        spyOn(idpVerificationService, 'updateField').and.callThrough();

        updatePanelField(mockField1, updatedFieldValue);
        fixture.detectChanges();

        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: updatedFieldValue });
        const fieldValue = getFieldValue(mockField1);
        expect(fieldValue).toBe(updatedFieldValue);
    });

    it('should update reject reason using IdpVerificationService', () => {
        const selectedReason: RejectReason = { id: '1', value: 'blurry image' };
        const rejectResult = { rejectReason: selectedReason, rejectNote: 'Rejected!' };

        spyOn(idpVerificationService, 'updateRejectReason').and.callThrough();

        const mockDialogRef = {
            afterClosed: () => ({
                subscribe: (callback: (result: any) => void) => callback(rejectResult),
            }),
        };
        spyOn(component.dialog, 'open').and.returnValue(mockDialogRef as any);

        component.openRejectDocumentDialog();
        fixture.detectChanges();

        expect(idpVerificationService.updateRejectReason).toHaveBeenCalled();
    });

    it('should undo and redo', () => {
        const updateFieldSpy = spyOn(idpVerificationService, 'updateField').and.callThrough();
        const originalValue = mockField1.value;

        expect(component.canUndo()).toBeFalse();
        expect(component.canRedo()).toBeFalse();

        updatePanelField(mockField1, updatedFieldValue);
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: updatedFieldValue });
        expect(getFieldValue(mockField1)).toEqual(updatedFieldValue);
        expect(component.canUndo()).toBeTrue();
        expect(component.canRedo()).toBeFalse();
        updateFieldSpy.calls.reset();

        // Due to mock ngrx store limitation, the actual field value on the component is not updated after this point.
        // Instead we verify that 'updateField' gets called and trust the other tests to make sure this has the intended effect.

        component.onUndo();
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: originalValue });
        expect(component.canUndo()).toBeFalse();
        expect(component.canRedo()).toBeTrue();
        updateFieldSpy.calls.reset();

        component.onRedo();
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: updatedFieldValue });
        expect(component.canUndo()).toBeTrue();
        expect(component.canRedo()).toBeFalse();
        updateFieldSpy.calls.reset();
    });

    it('should not be able to redo after manual change', () => {
        const updateFieldSpy = spyOn(idpVerificationService, 'updateField').and.callThrough();
        const originalValue = mockField1.value;

        expect(component.canUndo()).toBeFalse();
        expect(component.canRedo()).toBeFalse();

        updatePanelField(mockField1, updatedFieldValue);
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: updatedFieldValue });
        expect(getFieldValue(mockField1)).toEqual(updatedFieldValue);
        expect(component.canUndo()).toBeTrue();
        expect(component.canRedo()).toBeFalse();
        updateFieldSpy.calls.reset();

        // Due to mock ngrx store limitation, the actual field value on the component is not updated after this point.
        // Instead we verify that 'updateField' gets called and trust the other tests to make sure this has the intended effect.

        component.onUndo();
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: originalValue });
        expect(component.canUndo()).toBeFalse();
        expect(component.canRedo()).toBeTrue();
        updateFieldSpy.calls.reset();

        updatePanelField(mockField1, 'manual change');
        expect(idpVerificationService.updateField).toHaveBeenCalledWith({ ...mockField1, value: 'manual change' });
        expect(component.canUndo()).toBeTrue();
        expect(component.canRedo()).toBeFalse();
        updateFieldSpy.calls.reset();
    });

    it('should confirm field value and move to the next field with issue on Enter key press', () => {
        spyOn(idpVerificationService, 'selectNextField').and.callThrough();
        spyOn(idpVerificationService, 'updateField').and.callThrough();

        const firstFieldInput = findFieldInputDebugElement(mockField1)?.nativeElement;

        firstFieldInput.focus();
        firstFieldInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(idpVerificationService.updateField).toHaveBeenCalled();
        expect(idpVerificationService.selectNextField).toHaveBeenCalled();
    });

    it('should confirm field value on Enter key press even when there is only one field', () => {
        store.overrideSelector(selectDocument, {
            ...documentState,
            fields: [mockField1],
            hasIssue: false,
            pages: documentState.pages.map((page) => ({
                ...page,
                documentId: documentState.id,
                hasIssue: false,
                isSelected: false,
            })),
        });
        fixture = TestBed.createComponent(MetadataPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        spyOn(idpVerificationService, 'selectNextField').and.callThrough();
        spyOn(idpVerificationService, 'updateField').and.callThrough();

        const firstFieldInput = findFieldInputDebugElement(mockField1)?.nativeElement;

        firstFieldInput.focus();
        firstFieldInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(idpVerificationService.updateField).toHaveBeenCalled();
        expect(idpVerificationService.selectNextField).toHaveBeenCalled();
    });

    it('should not move to the next field with issue on a different key press', () => {
        spyOn(idpVerificationService, 'selectNextField').and.callThrough();

        const firstFieldInput = findFieldInputDebugElement(mockField1)?.nativeElement;

        firstFieldInput.focus();
        firstFieldInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));

        expect(idpVerificationService.selectNextField).not.toHaveBeenCalled();
    });

    it('should complete suggested field value when typing the beginning of the value', () => {
        const pageId = '1';
        component.ocrWords = [
            { text: 'foo', pageId },
            { text: 'far', pageId },
            { text: 'bar', pageId },
        ];
        const fieldInput =
            findFieldInputDebugElement(mockField1)?.nativeElement ??
            (() => {
                throw new Error('Field input not found');
            })();
        simulateFieldInput(fieldInput, '');
        expect(fieldInput.value).withContext('field should be blank').toBe('');
        simulateFieldInput(fieldInput, 'f');
        expect(fieldInput.value).withContext('ambiguous completion should not complete').toBe('f');
        simulateFieldInput(fieldInput, 'fo');
        expect(fieldInput.value).withContext('suggestion should complete').toBe('foo');
        simulateFieldInput(fieldInput, 'FA');
        expect(fieldInput.value).withContext('case-insensitive suggestion should complete').toBe('far');
        simulateFieldInput(fieldInput, 'foo b');
        expect(fieldInput.value).withContext('suggestion should not complete across non-contiguous words').toBe('foo b');
        simulateFieldInput(fieldInput, 'foo f');
        expect(fieldInput.value).withContext('suggestion should complete across contiguous words').toBe('foo far');
    });

    it('should not complete suggested field value across pages', () => {
        component.ocrWords = [
            { text: 'foo', pageId: '1' },
            { text: 'far', pageId: '2' },
        ];
        const fieldInput =
            findFieldInputDebugElement(mockField1)?.nativeElement ??
            (() => {
                throw new Error('Field input not found');
            })();
        simulateFieldInput(fieldInput, '');
        expect(fieldInput.value).withContext('field should be blank').toBe('');
        simulateFieldInput(fieldInput, 'foo f');
        expect(fieldInput.value).withContext('suggestion should not complete across pages').toBe('foo f');
    });
});
