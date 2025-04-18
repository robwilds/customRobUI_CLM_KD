/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { hasPermission, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { HxPCreateFolderDialogComponent } from '../create-folder/folder-create-dialog/folder-create-dialog.component';
import { HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { ContentServicesUploadService } from '@hxp/workspace-hxp/shared/services';
import { Observable } from 'rxjs';

@Component({
    standalone: false,
    selector: 'hxp-create-document-button',
    templateUrl: './create-document-button.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./create-document-button.component.scss'],
    host: { class: 'create-document-menu' },
    providers: [{ provide: HxpUploadService, useExisting: ContentServicesUploadService }],
})
export class HxPCreateDocumentButtonComponent implements OnChanges {
    @Input()
    document: Document;

    protected selectedFolderId$: Observable<string>;
    protected isAvailable = false;

    constructor(private dialog: MatDialog, private route: ActivatedRoute) {
        this.selectedFolderId$ = this.route.url.pipe(map((urlSegments = []) => (urlSegments.length > 0 ? urlSegments[0].path : '')));
    }

    ngOnChanges(): void {
        if (this.document) {
            this.isAvailable = hasPermission(this.document, DocumentPermissions.CREATE_CHILD);
        }
    }

    onCreate(): void {
        this.dialog.open(HxPCreateFolderDialogComponent, { width: '550px', disableClose: true });
    }
}
