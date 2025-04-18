/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { IdpBackendService } from './backend/idp-backend.service';
import { IdpSharedImageLoadingService } from './image/idp-shared-image-loading.service';

@NgModule({
    providers: [IdpBackendService, IdpSharedImageLoadingService],
})
export class IdpSharedServiceModule {}
