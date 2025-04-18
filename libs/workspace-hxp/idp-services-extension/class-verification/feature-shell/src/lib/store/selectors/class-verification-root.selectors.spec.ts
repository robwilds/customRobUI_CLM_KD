/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { documentAdapter, DocumentState, initialDocumentState } from '../states/document.state';
import { ClassVerificationRootState, initialClassVerificationRootState } from '../states/root.state';
import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import {
    documentClassFeatureSelector,
    documentFeatureSelector,
    screenFeatureSelector,
    undoRedoFeatureSelector,
} from './class-verification-root.selectors';
import { documentClassAdapter, DocumentClassState, initialDocumentClassState } from '../states/document-class.state';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';
import { initialScreenState, ScreenState } from '../states/screen.state';
import { IdpScreenViewFilter } from '../../models/common-models';
import { DocumentCreateStateUpdate, DocumentDeleteStateUpdate, DocumentUpdateStateUpdate } from '../models/document-state-updates';
import { DocOpUndoRedoState } from '../states/doc-op-undo-redo.state';

describe('Class Verification Root Selectors', () => {
    it('should select documents state', () => {
        const mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Loaded,
        };

        const documentEntities = mockDocumentEntities();

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: documentAdapter.setAll(documentEntities, mockDocumentState),
        };

        const result = documentFeatureSelector.projector(mockState);
        expect(result).toBeDefined();
        expect(result.loadState).toBe(IdpLoadState.Loaded);
        expect(result.ids.length).toEqual(documentEntities.length);
        expect(Object.values(result.entities)).toEqual(documentEntities);
    });

    it('should select document classes state', () => {
        const mockDocumentClassState: DocumentClassState = {
            ...initialDocumentClassState,
            loadState: IdpLoadState.Loaded,
        };

        const classes = mockIdpConfigClasses();

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documentClasses: documentClassAdapter.setAll(classes, mockDocumentClassState),
        };

        const result = documentClassFeatureSelector.projector(mockState);
        expect(result).toBeDefined();
        expect(result.loadState).toBe(IdpLoadState.Loaded);
        expect(result.ids.length).toEqual(classes.length);
        expect(Object.values(result.entities)).toEqual(classes);
    });

    it('should select screen state', () => {
        const mockScreenState: ScreenState = {
            ...initialScreenState,
            viewFilter: IdpScreenViewFilter.OnlyIssues,
            status: IdpLoadState.Loaded,
            taskContext: {
                appName: 'test-app',
                taskId: 'tid1',
                taskName: 'tn',
                rootProcessInstanceId: 'root1',
                processInstanceId: 'pid1',
                canClaimTask: false,
                canUnclaimTask: true,
            },
        };

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            screen: mockScreenState,
        };

        const result = screenFeatureSelector.projector(mockState);
        expect(result).toBeDefined();
        expect(result.viewFilter).toBe(IdpScreenViewFilter.OnlyIssues);
        expect(result.status).toBe(IdpLoadState.Loaded);
        expect(result.taskContext).toBeDefined();
        expect(result.taskContext.taskId).toEqual('tid1');
        expect(result.taskContext.taskName).toEqual('tn');
        expect(result.taskContext.rootProcessInstanceId).toEqual('root1');
        expect(result.taskContext.processInstanceId).toEqual('pid1');
    });

    it('should select undo redo state', () => {
        const documentEntities = mockDocumentEntities();

        const mockUndoRedoState: DocOpUndoRedoState = {
            undoStack: [
                {
                    operations: [
                        {
                            operation: 'create',
                            documentId: 'd_cf1',
                            update: documentEntities[0],
                            createAfterDocId: 'd_cf2',
                        },
                        {
                            operation: 'update',
                            documentId: 'd_cf2',
                            update: documentEntities[1],
                        },
                        {
                            operation: 'delete',
                            documentId: 'd_cf3',
                        },
                    ],
                },
                {
                    operations: [
                        {
                            operation: 'create',
                            documentId: 'd_cf2',
                            update: documentEntities[1],
                            createAfterDocId: 'd_cf3',
                        },
                    ],
                },
            ],
            redoStack: [
                {
                    operations: [
                        {
                            operation: 'create',
                            documentId: 'd_cf3',
                            update: documentEntities[2],
                            createAfterDocId: 'd_cf4',
                        },
                        {
                            operation: 'update',
                            documentId: 'd_cf4',
                            update: documentEntities[3],
                        },
                        {
                            operation: 'delete',
                            documentId: 'd_cf1',
                        },
                    ],
                },
            ],
        };

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            undoRedo: mockUndoRedoState,
        };

        const result = undoRedoFeatureSelector.projector(mockState);
        expect(result).toBeDefined();
        expect(result.undoStack.length).toEqual(2);

        const undoStack1 = result.undoStack[0].operations;
        expect(undoStack1.length).toEqual(3);

        let undoStack1Op1 = undoStack1[0];
        expect(undoStack1Op1.operation).toEqual('create');
        undoStack1Op1 = undoStack1Op1 as DocumentCreateStateUpdate;
        expect(undoStack1Op1.documentId).toEqual('d_cf1');
        expect(undoStack1Op1.update).toEqual(documentEntities[0]);
        expect(undoStack1Op1.createAfterDocId).toEqual('d_cf2');

        let undoStack1Op2 = undoStack1[1];
        expect(undoStack1Op2.operation).toEqual('update');
        undoStack1Op2 = undoStack1Op2 as DocumentUpdateStateUpdate;
        expect(undoStack1Op2.documentId).toEqual('d_cf2');
        expect(undoStack1Op2.update).toEqual(documentEntities[1]);

        const undoStack2 = result.undoStack[1].operations;
        expect(undoStack2.length).toEqual(1);

        expect(result.redoStack.length).toEqual(1);

        const redoStack1 = result.redoStack[0].operations;
        expect(redoStack1.length).toEqual(3);

        let redoStack1Op3 = redoStack1[2];
        expect(redoStack1Op3.operation).toEqual('delete');
        redoStack1Op3 = redoStack1Op3 as DocumentDeleteStateUpdate;
        expect(redoStack1Op3.documentId).toEqual('d_cf1');
    });
});
