/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { DocumentEntity } from '../states/document.state';
import { DocumentFieldEntity } from '../states/document-field.state';
import { IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { Store } from '@ngrx/store';
import { selectDocument } from '../selectors/document.selectors';
import { selectTaskInputData } from '../selectors/screen.selectors';
import { ApiDocument } from '../../models/contracts/field-verification-models';
import { cloneDeep } from 'es-toolkit/compat';
import { selectAllFields, selectFieldsWithIssue } from '../selectors/document-field.selectors';

@Injectable()
export class DocumentEffects {
    constructor(private readonly actions$: Actions, private readonly store: Store) {}

    loadDocumentEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadSuccess),
            map(({ taskData }) => {
                const taskDocument = taskData.batchState.documents[taskData.documentIndex];
                const documentClass = taskData?.classificationConfiguration?.documentClassDefinitions?.find(
                    (docClass) => docClass.id === taskDocument.classId
                );
                if (!documentClass) {
                    return systemActions.documentLoadError({ error: `Document class not found - ${taskDocument.classId}` });
                }

                const allFields =
                    taskData?.extractionConfiguration?.fieldDefinitionsByClass?.find((f) => f.documentClassId === documentClass.id)
                        ?.fieldDefinitions || [];

                const documentState: DocumentEntity = {
                    id: taskDocument.id,
                    name: taskDocument.name,
                    class: documentClass,
                    rejectReasonId: taskDocument.rejectReasonId,
                    markAsRejected: taskDocument.markAsRejected,
                    rejectNote: taskDocument.rejectNote,
                    pages: taskDocument.pages.map((taskPage) => {
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

                const fields: DocumentFieldEntity[] = allFields.map((fieldDef) => {
                    const docField = taskDocument.fields?.find((f) => f.id === fieldDef.id);
                    const relatedPageId =
                        docField?.boundingBox?.pageIndex === undefined ? '' : documentState.pages[docField.boundingBox.pageIndex]?.id;
                    return {
                        id: fieldDef.id,
                        name: fieldDef.name,
                        dataType: fieldDef.dataType,
                        format: fieldDef.format,
                        value: docField?.value,
                        confidence: docField?.extractionConfidence || 0,
                        boundingBox: docField?.boundingBox
                            ? {
                                  ...docField.boundingBox,
                                  pageId: relatedPageId,
                              }
                            : undefined,
                        verificationStatus:
                            docField?.extractionReviewStatus === 'ReviewNotRequired'
                                ? IdpVerificationStatus.AutoValid
                                : IdpVerificationStatus.AutoInvalid,
                    };
                });

                return systemActions.documentLoad({
                    documentState,
                    fields,
                });
            })
        )
    );

    selectInitialFieldEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentLoad),
            concatLatestFrom(() => this.store.select(selectAllFields)),
            map(([, allFields]) => {
                const fieldToSelect = allFields.find((f) => f.hasIssue) || allFields[0];
                return systemActions.movedToNextField({ id: fieldToSelect?.id });
            })
        )
    );

    moveNextFieldEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.selectNextField),
            concatLatestFrom(() => [this.store.select(selectAllFields), this.store.select(selectFieldsWithIssue)]),
            map(([, allFields, fieldsWithIssue]) => {
                const currentIndex = allFields.findIndex((f) => f.isSelected);
                let nextFieldIndex = 0;
                if (fieldsWithIssue.length > 0) {
                    // If we are on the last field that has an issue, move to the next field in the list
                    if (fieldsWithIssue.length === 1 && allFields[currentIndex] === fieldsWithIssue[0]) {
                        nextFieldIndex = (currentIndex + 1) % allFields.length;
                    } else {
                        const currentFieldIndex = fieldsWithIssue.findIndex((f) => f.id === allFields[currentIndex].id);
                        const nextFieldWithIssue = fieldsWithIssue.find((field, index) => index > currentFieldIndex) || fieldsWithIssue[0];
                        nextFieldIndex = allFields.findIndex((f) => f.id === nextFieldWithIssue.id);
                    }
                } else {
                    nextFieldIndex = (currentIndex + 1) % allFields.length;
                }
                return systemActions.movedToNextField({ id: allFields[nextFieldIndex]?.id });
            })
        )
    );

    rejectBatchEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.rejectReasonUpdate),
            map(() => userActions.taskComplete())
        )
    );

    taskDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdate),
            concatLatestFrom(() => {
                return this.store.select(selectDocument);
            }),
            concatLatestFrom(() => {
                return this.store.select(selectTaskInputData);
            }),
            map(([[{ taskAction }, documentState], taskInputData]) => {
                if (!taskInputData) {
                    return systemActions.taskPrepareUpdateError({ taskAction, error: 'Task data not found' });
                }

                const taskDocument = taskInputData.batchState.documents[taskInputData.documentIndex];

                let anyFieldWithIssue = false;

                const updatedDocument: ApiDocument = {
                    ...taskDocument,
                    fields: documentState.fields.map((f) => {
                        anyFieldWithIssue ||= f.hasIssue;

                        return {
                            id: f.id,
                            name: f.name,
                            value: f.value,
                            extractionConfidence: f.confidence,
                            extractionReviewStatus: f.hasIssue ? 'ReviewRequired' : 'ReviewNotRequired',
                            boundingBox: f.boundingBox
                                ? {
                                      top: f.boundingBox.top,
                                      left: f.boundingBox.left,
                                      height: f.boundingBox.height,
                                      width: f.boundingBox.width,
                                      pageIndex: f.boundingBox.pageIndex,
                                  }
                                : undefined,
                        };
                    }),
                    rejectReasonId: documentState.rejectReasonId,
                    markAsRejected: documentState.rejectReasonId ? true : false,
                };
                updatedDocument.extractionReviewStatus = anyFieldWithIssue ? 'ReviewRequired' : 'ReviewNotRequired';

                const updatedTaskData = cloneDeep(taskInputData);
                updatedTaskData.batchState.documents[taskInputData.documentIndex] = updatedDocument;

                // Re-evaluate batch state extraction status
                updatedTaskData.batchState.extractionStatus = updatedTaskData.batchState.documents.some(
                    (doc) => doc.extractionReviewStatus === 'ReviewRequired'
                )
                    ? 'ReviewRequired'
                    : 'Extracted';

                return systemActions.taskPrepareUpdateSuccess({ taskAction, taskData: updatedTaskData });
            })
        )
    );
}
