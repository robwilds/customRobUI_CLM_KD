/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { FileReaderService, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { AppConfigService } from '@alfresco/adf-core';
import { UploadApi } from '@hylandsoftware/hxcs-js-client';
import { UPLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

@Injectable({
    providedIn: 'root',
})
export class ContentServicesUploadService extends HxpUploadService {
    constructor(appConfigService: AppConfigService, fileReaderService: FileReaderService, @Inject(UPLOAD_API_TOKEN) uploadApi: UploadApi) {
        super(appConfigService, fileReaderService, uploadApi);
    }
}
