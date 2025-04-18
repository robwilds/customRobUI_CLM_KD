/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EventEmitter } from '@angular/core';
import { FileModel } from '../model/file.model';
import { HxpUploadService } from '../services/hxp-upload.service';

export class UploadFilesEvent {
    private isDefaultPrevented = false;

    constructor(
        public files: Array<FileModel>,
        private uploadService: HxpUploadService,
        private successEmitter: EventEmitter<any>,
        private errorEmitter: EventEmitter<any>
    ) {}

    get defaultPrevented() {
        return this.isDefaultPrevented;
    }

    preventDefault() {
        this.isDefaultPrevented = true;
    }

    pauseUpload() {
        this.preventDefault();
    }

    resumeUpload() {
        if (this.files && this.files.length > 0) {
            this.uploadService.addToQueue(...this.files);
            this.uploadService.uploadFilesInTheQueue(this.successEmitter, this.errorEmitter);
        }
    }
}
