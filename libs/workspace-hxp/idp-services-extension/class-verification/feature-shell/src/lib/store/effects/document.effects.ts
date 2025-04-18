/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ClassVerificationRootState } from '../states/root.state';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { ApiDocument } from '../../models/contracts/class-verification-models';
import { map } from 'rxjs';
import { DocumentEntity, isDocumentValid } from '../states/document.state';
import { selectClassById, selectDocumentEntityStateForIds, selectDocumentsRawState } from '../selectors/document.selectors';
import { DocumentStateUpdate } from '../models/document-state-updates';
import { v4 } from 'uuid';
import { cloneDeep } from 'es-toolkit/compat';
import { selectTaskInputData } from '../selectors/screen.selectors';
import { IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

@Injectable()
export class DocumentEffects {
    constructor(private readonly actions$: Actions, private readonly store: Store<ClassVerificationRootState>) {}

    loadDocumentEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadSuccess),
            map(({ taskData }) => {
                const availableClasses = taskData?.configuration?.documentClassDefinitions || [];
                const taskDocuments = taskData.batchState?.documents || [];
                const documents: DocumentEntity[] = taskDocuments.map((taskDoc) => {
                    const associatedClass = availableClasses.find((c) => c.id === taskDoc.classId);
                    const docClass = associatedClass ? { ...associatedClass, isSpecialClass: false } : undefined;

                    return {
                        id: taskDoc.id,
                        name: taskDoc.name || taskDoc.id,
                        class: docClass,
                        classificationConfidence: taskDoc.classificationConfidence || 0,
                        markAsDeleted: taskDoc.markAsDeleted || false,
                        rejectedReasonId: taskDoc.markAsRejected === true ? taskDoc.rejectReasonId : undefined,
                        verificationStatus:
                            taskDoc.classificationReviewStatus === 'ReviewRequired'
                                ? IdpVerificationStatus.AutoInvalid
                                : IdpVerificationStatus.AutoValid,
                        isGenerated: false,
                        pages: taskDoc.pages.map((taskPage) => {
                            const pageId = `${taskPage.contentFileReferenceIndex}_${taskPage.sourcePageIndex}`;
                            return {
                                id: pageId,
                                name: `Page ${pageId}`,
                                fileReference: taskData.batchState.contentFileReferences[taskPage.contentFileReferenceIndex].sys_id,
                                contentFileReferenceIndex: taskPage.contentFileReferenceIndex,
                                sourcePageIndex: taskPage.sourcePageIndex,
                            };
                        }),
                    };
                });

                return systemActions.createDocuments({ documents });
            })
        )
    );

    mergePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageMerge),
            concatLatestFrom(({ pages, targetDocumentId }) => {
                const uniqueDocumentIds = [...new Set<string>([targetDocumentId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, targetDocumentId }, contextDocuments]) => {
                const targetDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocumentId));
                if (!targetDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Merge - Target document not found ${targetDocumentId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof targetDocument> = {};
                const documentsToDelete: Array<typeof targetDocument> = [];

                for (const page of pages) {
                    if (page.documentId === targetDocumentId) {
                        continue;
                    }

                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Merge - Page not found ${page.id}`);
                    }

                    const pageState = sourceDocument.pages.splice(pageIndex, 1)[0];
                    targetDocument.pages.push(pageState);

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'update',
                        documentId: targetDocumentId,
                        update: targetDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_SUCCESS';
                const messageArgs = { pageCount: pages.length, documentName: targetDocument.name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    splitPageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageSplit),
            concatLatestFrom(({ pages, createAfterDocId }) => {
                const targetDocId = createAfterDocId || pages[0].documentId;
                const uniqueDocumentIds = [...new Set<string>([targetDocId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, createAfterDocId }, contextDocuments]) => {
                const targetDocId = createAfterDocId || pages[0].documentId;
                const createAfterDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocId));
                if (!createAfterDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Split - Target document not found ${targetDocId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_SPLIT_ERROR',
                    });
                }

                const newDocument: DocumentEntity = {
                    ...createAfterDocument,
                    id: this.uuid(),
                    name: `${createAfterDocument.name}_split`,
                    pages: [],
                    isGenerated: true,
                };

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof createAfterDocument> = {};
                const documentsToDelete: Array<typeof createAfterDocument> = [];

                for (const page of pages) {
                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Split - Page not found ${page.id}`);
                    }

                    const pageToSplit = sourceDocument.pages.splice(pageIndex, 1)[0];
                    newDocument.pages.push(pageToSplit);

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'create',
                        documentId: newDocument.id,
                        createAfterDocId: targetDocId,
                        update: newDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_SPLIT_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    uuid(): string {
        return v4();
    }

    movePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageMove),
            concatLatestFrom(({ pages, targetDocumentId }) => {
                const uniqueDocumentIds = [...new Set<string>([targetDocumentId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, targetDocumentId, targetIndex }, contextDocuments]) => {
                const targetDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocumentId));
                if (!targetDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Move Page - Target document not found ${targetDocumentId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.MOVE_PAGE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof targetDocument> = {};
                const documentsToDelete: Array<typeof targetDocument> = [];

                for (const page of pages) {
                    const sourceDocument =
                        page.documentId === targetDocumentId
                            ? targetDocument
                            : affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Move Page - Page not found ${page.id}`);
                    }

                    const pageToMove = sourceDocument.pages.splice(pageIndex, 1)[0];
                    targetDocument.pages.splice(targetIndex, 0, pageToMove);
                    targetIndex += 1;

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'update',
                        documentId: targetDocumentId,
                        update: targetDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.MOVE_PAGE_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    deletePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageDelete),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Delete Page - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_DELETE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, DocumentEntity> = {};
                const documentsToDelete: DocumentEntity[] = [];

                for (const page of pages) {
                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Delete Page - Page not found ${page.id}`);
                    }

                    sourceDocument.pages.splice(pageIndex, 1);

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_DELETE_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    documentResolveEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentResolve),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Resolve - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.markAsResolved = true;
                    updatedDoc.verificationStatus = IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = undefined;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_SUCCESS';
                return systemActions.documentOperationSuccess({ docAction, canUndoAction, updates, contextPageIds, notificationMessage });
            })
        )
    );

    documentRejectEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentReject),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, rejectReasonId, rejectNote }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Reject - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.classificationConfidence = 1;
                    updatedDoc.markAsResolved = false;
                    updatedDoc.verificationStatus = IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = rejectReasonId;
                    updatedDoc.rejectNote = rejectNote;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_SUCCESS';
                return systemActions.documentOperationSuccess({ docAction, canUndoAction, updates, contextPageIds, notificationMessage });
            })
        )
    );

    classChangeEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentClassChange),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            concatLatestFrom(([{ classId }]) => {
                return this.store.select(selectClassById(classId));
            }),
            map(([[{ docAction, canUndoAction, pages, classId }, contextDocuments], documentClass]) => {
                if (!documentClass) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Class Change - Not a valid document class ${classId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.CHANGE_CLASS_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.class = documentClass;
                    updatedDoc.classificationConfidence = 1;
                    updatedDoc.verificationStatus = IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = undefined;
                    updatedDoc.markAsResolved = false;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage =
                    'IDP_CLASS_VERIFICATION.USER_FEEDBACK.CHANGE_CLASS_SUCCESS_' + (contextDocuments.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { className: documentClass.name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    documentOpSuccessEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentOperationSuccess),
            map(({ notificationMessage, messageArgs }) => {
                return systemActions.notificationShow({ severity: 'success', message: notificationMessage, messageArgs });
            })
        )
    );

    documentOpErrorEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentOperationError),
            map(({ error, notificationMessage }) => {
                console.error(error);
                return systemActions.notificationShow({ severity: 'error', message: notificationMessage, messageArgs: { error } });
            })
        )
    );

    taskDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdate),
            concatLatestFrom(() => {
                return this.store.select(selectDocumentsRawState);
            }),
            concatLatestFrom(() => {
                return this.store.select(selectTaskInputData);
            }),
            map(([[{ taskAction }, documentEntities], taskInputData]) => {
                if (!taskInputData) {
                    return systemActions.taskPrepareUpdateError({ taskAction, error: 'Task data not found' });
                }

                let hasRejectedDocuments = false;
                let anyWithIssue = false;

                const updatedDocuments: ApiDocument[] = documentEntities.map((doc) => {
                    const updatedReviewStatus =
                        doc.verificationStatus === IdpVerificationStatus.ManualValid
                            ? 'ReviewNotRequired'
                            : taskInputData.batchState.documents.find((d) => d.id === doc.id)?.classificationReviewStatus;
                    const isRejected = Boolean(doc.rejectedReasonId);
                    hasRejectedDocuments ||= isRejected;
                    anyWithIssue ||= !isDocumentValid(doc, taskInputData.configuration.documentClassDefinitions);

                    return {
                        id: doc.id,
                        name: doc.name,
                        markAsDeleted: doc.markAsDeleted,
                        markAsRejected: isRejected,
                        markAsResolved: doc.markAsResolved,
                        rejectReasonId: doc.rejectedReasonId,
                        rejectNote: doc.rejectNote,
                        classId: doc.class?.id,
                        classificationConfidence: doc.classificationConfidence,
                        classificationReviewStatus: updatedReviewStatus,
                        pages: doc.pages.map((page) => {
                            return {
                                contentFileReferenceIndex: page.contentFileReferenceIndex,
                                sourcePageIndex: page.sourcePageIndex,
                            };
                        }),
                    };
                });

                const updatedTaskData = cloneDeep(taskInputData);
                updatedTaskData.batchState.documents = updatedDocuments;
                updatedTaskData.batchState.hasRejectedDocuments = hasRejectedDocuments;
                updatedTaskData.batchState.classificationStatus = anyWithIssue ? 'ReviewRequired' : 'Classified';

                return systemActions.taskPrepareUpdateSuccess({ taskAction, taskData: updatedTaskData });
            })
        )
    );
}
