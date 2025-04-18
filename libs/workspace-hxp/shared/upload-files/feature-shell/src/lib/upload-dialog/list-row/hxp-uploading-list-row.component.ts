/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FileModel, FileUploadStatus } from '../../model/file.model';

@Component({
    standalone: false,
    selector: 'hxp-file-uploading-list-row',
    templateUrl: './hxp-uploading-list-row.component.html',
    styleUrls: ['./hxp-uploading-list-row.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HxpUploadingListRowComponent {
    @Input()
    file?: FileModel;

    @Output()
    cancel = new EventEmitter<FileModel>();

    get versionNumber(): string {
        return this.file?.data?.entry?.properties['cm:versionLabel'];
    }

    get mimeType(): string {
        if (this.file && this.file.file && this.file.file.type) {
            return this.file.file.type;
        }

        return 'default';
    }

    onCancel(file: FileModel): void {
        this.cancel.emit(file);
    }

    showCancelledStatus(): boolean {
        if (!this.file) {
            return false;
        }
        return (
            this.file.status === FileUploadStatus.Cancelled ||
            this.file.status === FileUploadStatus.Aborted ||
            this.file.status === FileUploadStatus.Deleted
        );
    }

    isUploadVersion(): boolean {
        return (
            !!this.file?.data &&
            this.file?.options &&
            this.file?.options.newVersion &&
            this.file?.data?.entry?.properties &&
            this.file?.data?.entry?.properties['cm:versionLabel']
        );
    }

    canCancelUpload(): boolean {
        return !!this.file && this.file.status === FileUploadStatus.Pending;
    }

    isUploadError(): boolean {
        return !!this.file && this.file.status === FileUploadStatus.Error;
    }

    isUploading(): boolean {
        return !!this.file && (this.file.status === FileUploadStatus.Progress || this.file.status === FileUploadStatus.Starting);
    }

    isUploadComplete(): boolean {
        return this.file?.status === FileUploadStatus.Complete && !this.isUploadVersion();
    }

    isUploadVersionComplete(): boolean {
        return !!this.file && this.file.status === FileUploadStatus.Complete && this.isUploadVersion();
    }
}
