/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpContextTaskBaseService, IdpShortcutService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { FieldVerificationContextTaskService } from './context-task/field-verification-context-task.service';
import { ActionHistoryService, ActionLinearHistoryService } from './action-history.service';
import { IdpVerificationService } from './verification/verification.service';
import { IdpImageLoadingService } from './image/idp-image-loading.service';

export const IDP_FIELD_VERIFICATION_SERVICES_PROVIDER = [
    {
        provide: IdpContextTaskBaseService,
        useClass: FieldVerificationContextTaskService,
    },
    { provide: ActionHistoryService, useClass: ActionLinearHistoryService },
    FieldVerificationContextTaskService,
    IdpShortcutService,
    IdpVerificationService,
    IdpImageLoadingService,
];
