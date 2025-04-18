/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { SnackbarErrorAction } from '@alfresco/aca-shared/store';
import { CustomModeledExtensionTestingModule } from '../testing/custom-modeled-extension-testing.module';
import { FormActionDialogService } from './form-action-dialog.service';
import { formWithUploadWidgets, formWithoutUploadWidgets } from './upload-widget-forms.mock';

describe('FormActionDialogService', () => {
    let store: Store<any>;
    let service: FormActionDialogService;
    let spy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CustomModeledExtensionTestingModule],
        });

        store = TestBed.inject(Store);
        service = TestBed.inject(FormActionDialogService);

        spy = spyOn(store, 'dispatch').and.callThrough();
    });

    it('Should be able to fetch only upload widgets from the start form', () => {
        const expectedResult = [
            { id: 'attachFile1', type: 'single' },
            { id: 'attachFile2', type: 'single' },
        ];
        expect(service.getUploadWidgetFields(formWithUploadWidgets)).toEqual(expectedResult);
    });

    it('Should dispatch SnackbarErrorAction if form does not have upload widgets', () => {
        service.getUploadWidgetFields(formWithoutUploadWidgets);
        expect(spy).toHaveBeenCalledWith(new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.CAN_NOT_ATTACH'));
    });
});
