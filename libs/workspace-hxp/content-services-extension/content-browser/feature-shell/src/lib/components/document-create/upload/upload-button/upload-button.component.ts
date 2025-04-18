/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FileModel, HxpUploadModule, HxpUploadService, UploadHxpButtonComponent } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { TranslationService } from '@alfresco/adf-core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UploadDialogService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

@Component({
    selector: 'hxp-workspace-upload-file-button',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatMenuModule, HxpUploadModule, TranslateModule],
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss'],
})
export class UploadFileButtonComponent extends UploadHxpButtonComponent {
    @Input() isAvailable = true;
    @Input() data: ActionContext = { documents: [] };

    constructor(
        protected hxpUploadService: HxpUploadService,
        protected override translationService: TranslationService,
        protected override ngZone: NgZone,
        protected uploadDialogService: UploadDialogService
    ) {
        super(hxpUploadService, translationService, ngZone);
    }

    uploadFiles(files: File[]): void {
        if (!this.isAvailable) {
            return;
        }

        const filteredFiles: FileModel[] = files
            .map<FileModel>((file: File) =>
                this.createFileModel(file, this.rootFolderId, ((file as any).webkitRelativePath || '').replace(/\/[^/]*$/, ''))
            )
            .filter(this.isFileAcceptable.bind(this))
            .filter(this.isFileSizeAcceptable.bind(this));

        this.uploadDialogService.uploadFiles(filteredFiles);
    }
}
