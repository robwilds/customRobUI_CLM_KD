/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogComponent } from './components/info-dialog/info-dialog.component';
import { MultipleChoiceDialogComponent } from './components/multiple-choice-dialog/multiple-choice-dialog.component';

@NgModule({
    imports: [CommonModule, MatIconModule, RouterModule, ConfirmationDialogComponent, InfoDialogComponent, MultipleChoiceDialogComponent],
    exports: [CommonModule, MatIconModule, RouterModule],
})
export class SharedDialogModule {}
