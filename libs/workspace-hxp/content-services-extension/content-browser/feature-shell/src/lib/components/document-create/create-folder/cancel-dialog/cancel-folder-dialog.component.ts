/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HxPCreateFolderDialogComponent } from '../folder-create-dialog/folder-create-dialog.component';

@Component({
    standalone: false,
    selector: 'hxp-cancel-folder-dialog',
    templateUrl: './cancel-folder-dialog.component.html',
    styleUrls: ['./cancel-folder-dialog.component.scss'],
})
export class CancelFolderDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<CancelFolderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) readonly createDialogRef: MatDialogRef<HxPCreateFolderDialogComponent>
    ) {}

    confirm() {
        this.dialogRef.close();
        this.createDialogRef.close();
    }

    reject() {
        this.dialogRef.close();
    }
}
