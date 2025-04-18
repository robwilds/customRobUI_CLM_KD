/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { PendoService } from './pendo.service';
import { analyticsFactoryService } from './analytics-factory.service';

@NgModule({
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: analyticsFactoryService,
            deps: [PendoService],
            multi: true,
        },
    ],
})
export class AnalyticsModule {}
