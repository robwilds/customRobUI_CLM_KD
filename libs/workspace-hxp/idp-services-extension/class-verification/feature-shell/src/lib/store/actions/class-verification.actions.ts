/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IdpScreenViewFilter } from '../../models/common-models';
import { IdpDocumentPage, IdpTaskData } from '../../models/screen-models';
import { DocumentEntity, DocumentState } from '../states/document.state';
import { DocumentStateUpdate } from '../models/document-state-updates';
import { IdpDocumentAction } from './../../models/screen-models';
import { IdpTaskActions, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';

interface DocActionCommonProps {
    docAction: IdpDocumentAction;
    canUndoAction: boolean;
    pages: IdpDocumentPage[];
}

export const userActions = createActionGroup({
    source: 'Hx Idp Class Verification User',
    events: {
        // document and page structure actions
        pageMerge: props<DocActionCommonProps & { targetDocumentId: string }>(),
        pageSplit: props<DocActionCommonProps & { createAfterDocId?: string }>(),
        pageMove: props<DocActionCommonProps & { targetDocumentId: string; targetIndex: number }>(),
        pageDelete: props<DocActionCommonProps>(),
        documentClassChange: props<DocActionCommonProps & { classId: string }>(),
        documentResolve: props<DocActionCommonProps>(),
        documentReject: props<DocActionCommonProps & { rejectReasonId: string; rejectNote?: string }>(),

        // selection and ui state actions
        pageSelect: props<{ pageIds: string[] }>(),
        documentExpandToggle: props<{ documentId: string }>(),
        documentPreviewToggle: props<{ documentId?: string }>(),
        documentDragToggle: props<{ documentId: string }>(),

        // class actions
        classSelect: props<{ classId: string }>(),
        classExpandToggle: props<{ classId: string }>(),
        classPreviewToggle: props<{ classId?: string }>(),

        // view actions
        viewFilterChange: props<{ filter: IdpScreenViewFilter }>(),
        viewFilterToggle: emptyProps(),
        changeFullScreen: props<{ fullScreen: boolean }>(),

        // undo redo actions
        undoAction: emptyProps(),
        redoAction: emptyProps(),

        // task actions
        taskSave: emptyProps(),
        taskComplete: emptyProps(),
        taskCancel: emptyProps(),
    },
});

export const systemActions = createActionGroup({
    source: 'Hx Idp Class Verification System',
    events: {
        // screen actions
        screenLoad: props<{ taskContext: TaskContext }>(),
        screenLoadSuccess: props<{ taskData: IdpTaskData; taskContext: TaskContext }>(),
        screenLoadError: props<{ error: Error }>(),
        screenUnload: emptyProps(),

        // document actions
        createDocuments: props<{ documents: DocumentEntity[] }>(),
        documentOperationSuccess: props<{
            docAction: IdpDocumentAction;
            canUndoAction: boolean;
            updates: DocumentStateUpdate[];
            contextPageIds: string[];
            notificationMessage: string;
            messageArgs?: Record<string, any>;
        }>(),
        documentOperationError: props<{
            docAction: IdpDocumentAction;
            error: Error | string;
            notificationMessage: string;
            messageArgs?: Record<string, any>;
        }>(),
        applyDocumentUpdates: props<{ updates: DocumentStateUpdate[] }>(),

        // notification actions
        notificationShow: props<{ severity: 'info' | 'success' | 'error' | 'warn'; message: string; messageArgs?: Record<string, any> }>(),

        // task actions
        taskActionSuccess: props<{ action: IdpTaskActions }>(),
        taskActionError: props<{ error: Error | string; action?: IdpTaskActions }>(),
        taskPrepareUpdate: props<{ taskAction: IdpTaskActions }>(),
        taskPrepareUpdateSuccess: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData }>(),
        taskPrepareUpdateError: props<{ taskAction: IdpTaskActions; error: Error | string }>(),

        // undo redo actions
        registerUndoDocumentOperation: props<{ docState: DocumentState; updates: DocumentStateUpdate[] }>(),
        undoAction: props<{ docState: DocumentState }>(),
        redoAction: props<{ docState: DocumentState }>(),

        // task claim
        taskClaim: props<{ taskContext: TaskContext }>(),
        taskClaimSuccess: props<{ taskContext: TaskContext }>(),
        taskUnclaim: emptyProps(),
    },
});
