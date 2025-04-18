/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IdpTaskActions, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DocumentEntity } from '../states/document.state';
import { DocumentFieldEntity } from '../states/document-field.state';
import { IdpBoundingBox, IdpTaskData } from '../../models/screen-models';

export const userActions = createActionGroup({
    source: 'Idp Field Verification - User',
    events: {
        // field actions
        fieldSelect: props<{ fieldId: string }>(),
        fieldValueUpdate: props<{ fieldId: string; value: string; boundingBox?: IdpBoundingBox }>(),

        // document actions
        pageSelect: props<{ pageId: string }>(),
        rejectReasonUpdate: props<{ rejectReasonId: string; rejectNote?: string }>(),

        selectNextField: emptyProps(),

        // task actions
        taskSave: emptyProps(),
        taskComplete: emptyProps(),
        taskCancel: emptyProps(),
    },
});

export const systemActions = createActionGroup({
    source: 'Idp Field Verification - System',
    events: {
        // screen actions
        screenLoad: props<{ taskContext: TaskContext }>(),
        screenLoadSuccess: props<{ taskContext: TaskContext; taskData: IdpTaskData }>(),
        screenLoadError: props<{ error: Error | string }>(),
        screenUnload: emptyProps(),

        // document actions
        documentLoad: props<{ documentState: DocumentEntity; fields: DocumentFieldEntity[] }>(),
        documentLoadError: props<{ error: Error | string }>(),
        movedToNextField: props<{ id: string | undefined }>(),

        // task actions
        taskActionSuccess: props<{ action: IdpTaskActions }>(),
        taskActionError: props<{ error: Error | string; action?: IdpTaskActions }>(),
        taskPrepareUpdate: props<{ taskAction: IdpTaskActions }>(),
        taskPrepareUpdateSuccess: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData }>(),
        taskPrepareUpdateError: props<{ taskAction: IdpTaskActions; error: Error | string }>(),

        // notification actions
        notificationShow: props<{ severity: 'info' | 'success' | 'error' | 'warn'; message: string; messageArgs?: Record<string, any> }>(),

        // task claim
        taskClaim: props<{ taskContext: TaskContext }>(),
        taskClaimSuccess: props<{ taskContext: TaskContext }>(),
        taskUnclaim: emptyProps(),
    },
});
