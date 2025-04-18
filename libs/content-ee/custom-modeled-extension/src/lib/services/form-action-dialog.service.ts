/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SnackbarErrorAction } from '@alfresco/aca-shared/store';
import { FormFieldModel } from '@alfresco/adf-core';

export interface UploadWidget {
    id: string;
    type: string;
}
@Injectable({
    providedIn: 'root',
})
export class FormActionDialogService {
    static UPLOAD = 'upload';
    static MULTIPLE = 'multiple';
    static SINGLE = 'single';

    constructor(private store: Store<any>) {}

    getUploadWidgetFields(fieldContainers: FormFieldModel[]): UploadWidget[] {
        const uploadWidgets = this.filterFieldsByType(this.getFormFields(fieldContainers), FormActionDialogService.UPLOAD);

        if (uploadWidgets.length === 0) {
            this.store.dispatch(new SnackbarErrorAction('CUSTOM_MODELED_EXTENSION.SNACKBAR.CAN_NOT_ATTACH'));
        }

        return uploadWidgets.map(
            (filteredWidget: FormFieldModel) =>
                <UploadWidget>{
                    id: filteredWidget.id,
                    type: filteredWidget.params['multiple'] ? FormActionDialogService.MULTIPLE : FormActionDialogService.SINGLE,
                }
        );
    }

    private getFormFields(fieldContainers: FormFieldModel[]): FormFieldModel[] {
        return fieldContainers
            .map((fieldContainer) => [].concat(...Object.values(fieldContainer.fields)))
            .reduce((previous, current) => previous.concat(current));
    }

    private filterFieldsByType(fields: FormFieldModel[], fieldType: string): FormFieldModel[] {
        return fields.filter((widget) => widget.type === fieldType);
    }
}
