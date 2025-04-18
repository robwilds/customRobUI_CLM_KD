/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CoreModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HxpUploadingDialogComponent } from './upload-dialog/dialog/hxp-uploading-dialog.component';
import { HxpUploadingListComponent } from './upload-dialog/files-list/hxp-uploading-list.component';
import { HxpUploadingListRowComponent } from './upload-dialog/list-row/hxp-uploading-list-row.component';
import { UploadHxpButtonComponent } from './upload-button/upload-hxp-button.component';
import { HxpFileUploadErrorPipe } from './pipes/hxp-file-upload-error.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToggleIconDirective } from './directives/toggle-icon.directive';
import { HxpFileDraggableDirective } from './directives/hxp-file-draggable.directive';
import { MatIconModule } from '@angular/material/icon';
import { HxpUploadDragAreaComponent } from './upload-drag/hxp-upload-drag-area.component';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatTooltipModule } from '@angular/material/tooltip';
import { uploadApiProvider } from '@alfresco/adf-hx-content-services/api';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        TranslateModule,
        MatSlideToggleModule,
        MatIconModule,
        MimeTypeIconComponent,
        MatTooltipModule,
        HxpFileUploadErrorPipe,
    ],
    declarations: [
        HxpUploadDragAreaComponent,
        HxpUploadingListRowComponent,
        HxpUploadingListComponent,
        HxpUploadingDialogComponent,
        UploadHxpButtonComponent,
        HxpFileDraggableDirective,
        ToggleIconDirective,
    ],
    exports: [
        HxpUploadDragAreaComponent,
        HxpUploadingListRowComponent,
        HxpUploadingListComponent,
        HxpUploadingDialogComponent,
        UploadHxpButtonComponent,
        HxpFileUploadErrorPipe,
        HxpFileDraggableDirective,
        ToggleIconDirective,
    ],
    providers: [uploadApiProvider],
})
export class HxpUploadModule {}
