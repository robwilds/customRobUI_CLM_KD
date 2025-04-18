/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HxpWorkspaceDocumentTreeComponent } from './hxp-workspace-document-tree.component';
import { Observable, Subject, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
    DocumentFetchResults,
    DocumentService,
    ContextMenuActionsService,
    DocumentActionService,
    ActionContext,
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    BlobDownloadService,
    DocumentTreeDatabaseService,
    ManageVersionsButtonActionService,
} from '@alfresco/adf-hx-content-services/services';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { CheckboxHarnessUtils, TreeHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { take } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

// https://github.com/dequelabs/axe-core/issues/3464
const EXPECTED_CONTEXT_INCOMPLETE_VIOLATIONS = [
    {
        'color-contrast': 0,
    },
];

const EXPECTED_CONTEXT_VIOLATIONS: any = [];

const EXPECTED_VIOLATIONS: any = [
    {
        'aria-allowed-attr': 3,
    },
];

const REFRESH_DEBOUNCE = 1000;

const mockDocumentService: DocumentService = MockService(DocumentService);
const mockDeleteDocumentSpy = (spy: jest.SpyInstance<Observable<string>>, document: Document) => {
    return spy.mockImplementation((documentId: string) => {
        if (documentId === (document.sys_id ?? '')) {
            (mockDocumentService.documentDeleted$ as Subject<string>).next(documentId);
            return of(documentId);
        }
        return of('');
    });
};

const mockCreateDocumentSpy = (spy: jest.SpyInstance<Observable<Document>>, document: Document) => {
    return spy.mockImplementation(() => {
        (mockDocumentService.documentCreated$ as Subject<Document>).next(document);
        return of(document);
    });
};

class MockDocumentActionService extends DocumentActionService {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    isAvailable(context: ActionContext): boolean {
        return true;
    }

    execute(context: ActionContext) {
        // nothing to do
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}

const getAllCheckboxes = (params: {
    fixture: ComponentFixture<HxpWorkspaceDocumentTreeComponent>;
    checked: boolean;
}): Promise<MatCheckboxHarness[]> => {
    return CheckboxHarnessUtils.getAllCheckboxes({
        fixture: params.fixture,
        checkboxFilters: {
            checked: params.checked,
            selector: '.hxp-node-selection-checkbox',
        },
        fromRoot: true,
    });
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(
        () =>
            ({
                canvas: document.createElement('canvas'),
                getContextAttributes: jest.fn(),
            } as unknown as Partial<CanvasRenderingContext2D>)
    ),
});

describe('HXP Document Tree', () => {
    let getFolderChildrenSpy: jest.SpyInstance<Observable<DocumentFetchResults>>;
    let getAncestorsSpy: jest.SpyInstance<Observable<Document[]>>;
    let notifyDocumentLoadedSpy: jest.SpyInstance<void, [document: Document], any>;
    let createDocumentSpy: jest.SpyInstance<Observable<Document>>;
    let deletedDocumentSpy: jest.SpyInstance<Observable<string>>;

    let component: HxpWorkspaceDocumentTreeComponent;
    let fixture: ComponentFixture<HxpWorkspaceDocumentTreeComponent>;

    const mockDocumentCopyActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockDocumentMoveActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockContentShareButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockDeleteButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockPermissionsButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockSingleItemDownloadButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockSingleItemInfoButtonActionService: DocumentActionService = MockService(MockDocumentActionService);
    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);
    const mockBlobDownloadService = MockService(BlobDownloadService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HxpWorkspaceDocumentTreeComponent, RouterTestingModule, NoopAnimationsModule, NoopTranslateModule],
            providers: [
                { provide: HXP_DOCUMENT_COPY_ACTION_SERVICE, useValue: mockDocumentCopyActionService },
                { provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE, useValue: mockDocumentMoveActionService },
                { provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE, useValue: mockDeleteButtonActionService },
                { provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE, useValue: mockContentShareButtonActionService },
                { provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE, useValue: mockPermissionsButtonActionService },
                { provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE, useValue: mockSingleItemDownloadButtonActionService },
                { provide: HXP_DOCUMENT_INFO_ACTION_SERVICE, useValue: mockSingleItemInfoButtonActionService },
                { provide: ManageVersionsButtonActionService, useValue: mockManageVersionsButtonActionService },
                MockProvider(DocumentService, mockDocumentService),
                MockProvider(ContextMenuActionsService),
                DocumentTreeDatabaseService,
                { provide: BlobDownloadService, useValue: mockBlobDownloadService },
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                }),
            ],
        });
        mockDocumentService.documentDeleted$ = new Subject();
        mockDocumentService.documentCreated$ = new Subject();
        mockDocumentService.documentLoaded$ = new Subject();
        mockDocumentService.documentUpdated$ = new Subject();
        mockDocumentService.documentMoved$ = new Subject();
        mockDocumentService.documentCopied$ = new Subject();

        ngMocks.autoSpy('jest');
        getFolderChildrenSpy = jest.spyOn(mockDocumentService, 'getFolderChildren').mockImplementation((documentId: string) => {
            if (documentId === ROOT_DOCUMENT.sys_id || documentId === jestMocks.folderDocument.sys_id) {
                return of({
                    documents: [...jestMocks.nestedDocumentAncestors],
                    limit: 10,
                    offset: 0,
                    totalCount: 2,
                });
            }
            return of({ documents: [], limit: 0, offset: 0, totalCount: 0 });
        });

        getAncestorsSpy = jest.spyOn(mockDocumentService, 'getAncestors').mockImplementation((documentId: string) => {
            switch (documentId) {
                case jestMocks.folderDocument.sys_id: {
                    return of([ROOT_DOCUMENT, ...jestMocks.nestedDocumentAncestors]);
                }
                case jestMocks.fileDocument.sys_id: {
                    return of([ROOT_DOCUMENT]);
                }
                case jestMocks.nestedDocument.sys_id: {
                    return of([ROOT_DOCUMENT, jestMocks.folderDocument]);
                }
                default: {
                    return of([]);
                }
            }
        });

        notifyDocumentLoadedSpy = jest
            .spyOn(mockDocumentService, 'notifyDocumentLoaded')
            .mockImplementation((doc: Document) => (mockDocumentService.documentLoaded$ as Subject<Document>).next(doc));

        deletedDocumentSpy = jest.spyOn(mockDocumentService, 'deleteDocument');
        mockDeleteDocumentSpy(deletedDocumentSpy, jestMocks.folderDocument);
        mockDeleteDocumentSpy(deletedDocumentSpy, jestMocks.fileDocument);

        createDocumentSpy = jest.spyOn(mockDocumentService, 'createDocument');
        mockCreateDocumentSpy(createDocumentSpy, jestMocks.nestedDocumentAncestors2[0]);
        mockCreateDocumentSpy(createDocumentSpy, jestMocks.fileDocument);

        fixture = TestBed.createComponent(HxpWorkspaceDocumentTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        Element.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
        getFolderChildrenSpy.mockReset();
        getAncestorsSpy.mockReset();
        notifyDocumentLoadedSpy.mockReset();
        createDocumentSpy.mockReset();
        deletedDocumentSpy.mockReset();
    });

    it('should render the document tree with children', async () => {
        expect(component).toBeTruthy();
        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        const [root, node1, node2] = nodes;
        expect(root).not.toBeNull();
        expect(node1).not.toBeNull();
        expect(node2).not.toBeNull();

        expect(await root.getText()).toEqual('DOCUMENT_TREE.ROOT');
        expect(await node1.getText()).toEqual('Folder 1');
        expect(await node2.getText()).toEqual('Nested Folder 1');
    });

    it('should render children documents upon node expansion', async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        const [root, node1, node2] = nodes;
        expect(root).not.toBeNull();
        expect(node1).not.toBeNull();
        expect(node2).not.toBeNull();

        await node1.expand();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes.length).toBe(5);
    });

    it('should select the document on node click', async () => {
        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        const [root, node1, node2] = nodes;
        expect(root).not.toBeNull();
        expect(node1).not.toBeNull();
        expect(node2).not.toBeNull();

        expect(await (await node1.host()).hasClass('hxp-selected')).toBe(false);

        const selectedDocument = component.selectedDocument.pipe(take(1)).toPromise();

        const nodeContainers = fixture.debugElement.queryAll(By.css('.hxp-node-container'));
        nodeContainers[1].nativeElement.click();
        fixture.detectChanges();

        expect(await (await node1.host()).hasClass('hxp-selected')).toBeTruthy();
        expect(await selectedDocument).toEqual(jestMocks.nestedDocumentAncestors[0]);
    });

    it('should not select already selected document on node click', async () => {
        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        const [root, node1, node2] = nodes;
        const selectedDocument = component.selectedDocument.pipe(take(2)).toPromise();

        expect(root).not.toBeNull();
        expect(node1).not.toBeNull();
        expect(node2).not.toBeNull();

        const nodeContainers = fixture.debugElement.queryAll(By.css('.hxp-node-container'));

        nodeContainers[1].nativeElement.click();
        fixture.detectChanges();

        nodeContainers[1].nativeElement.click();
        fixture.detectChanges();

        nodeContainers[2].nativeElement.click();
        fixture.detectChanges();

        /*
            We're taking 2 emissions from the selectedDocument observable, but selecting documents
            3 times. This is because the second time we select the same document, the observable is supposed
            to omit the same value again, firing only on the third event with the different document.
         */

        const selectedDocumentResults = await selectedDocument;
        expect(selectedDocumentResults).toEqual(jestMocks.nestedDocumentAncestors[1]);
    });

    it('should update the tree when a folderish document is deleted', fakeAsync(async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        getFolderChildrenSpy.mockImplementation((parentId) => {
            if (parentId === ROOT_DOCUMENT.sys_id) {
                return of({
                    documents: [...jestMocks.nestedDocumentAncestors].filter((doc) => doc.sys_id !== jestMocks.folderDocument.sys_id),
                    limit: 10,
                    offset: 0,
                    totalCount: 1,
                });
            }
            return of({ documents: [], limit: 10, offset: 0, totalCount: 0 });
        });

        tick(REFRESH_DEBOUNCE);

        expect(deletedDocumentSpy).not.toHaveBeenCalled();
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        mockDeleteDocumentSpy(deletedDocumentSpy, jestMocks.folderDocument);
        await mockDocumentService.deleteDocument(jestMocks.folderDocument.sys_id);
        tick(REFRESH_DEBOUNCE);
        fixture.detectChanges();

        expect(deletedDocumentSpy).toHaveBeenCalledTimes(1);
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(2);
    }));

    it('should not change the tree when a non-folderish document is deleted', fakeAsync(async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        expect(deletedDocumentSpy).not.toHaveBeenCalled();
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        mockDeleteDocumentSpy(deletedDocumentSpy, jestMocks.fileDocument);
        await mockDocumentService.deleteDocument(jestMocks.fileDocument.sys_id);
        tick(REFRESH_DEBOUNCE);
        fixture.detectChanges();

        expect(deletedDocumentSpy).toHaveBeenCalledTimes(1);
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);
    }));

    it('should update the tree when a folderish document is created', fakeAsync(async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        getFolderChildrenSpy.mockImplementation((parentId) => {
            if (parentId === ROOT_DOCUMENT.sys_id) {
                return of({
                    documents: [...jestMocks.nestedDocumentAncestors, jestMocks.nestedDocumentAncestors2[0]],
                    limit: 10,
                    offset: 0,
                    totalCount: 1,
                });
            }
            return of({ documents: [], limit: 10, offset: 0, totalCount: 0 });
        });

        tick(REFRESH_DEBOUNCE);

        expect(createDocumentSpy).not.toHaveBeenCalled();
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        await mockDocumentService.createDocument({ sys_primaryType: 'SysFolder' });
        tick(REFRESH_DEBOUNCE);
        fixture.detectChanges();

        expect(createDocumentSpy).toHaveBeenCalledTimes(1);
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(2);

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(4);
    }));

    it('should not change the tree when a non-folderish document is created', fakeAsync(async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);

        expect(createDocumentSpy).not.toHaveBeenCalled();
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(1);

        await mockDocumentService.createDocument({ sys_primaryType: 'SysFile' });
        tick(REFRESH_DEBOUNCE);
        fixture.detectChanges();

        expect(createDocumentSpy).toHaveBeenCalledTimes(1);
        expect(getFolderChildrenSpy).toHaveBeenCalledTimes(2);

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });
        expect(nodes).toHaveLength(3);
    }));

    it('should allow multiple document selection', async () => {
        const selectedDocuments: Document[] = [];
        const selectedDocumentSpy = spyOn(component.selectedDocument, 'emit').and.callThrough();
        component.selectedDocument.subscribe((value) => selectedDocuments.push(value));

        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(3);

        let checkboxes = await getAllCheckboxes({ fixture, checked: false });

        expect(checkboxes).toHaveLength(0);

        component.multiSelection = true;
        fixture.detectChanges();

        checkboxes = await getAllCheckboxes({ fixture, checked: false });

        expect(checkboxes).toHaveLength(2);
        expect(selectedDocumentSpy).not.toHaveBeenCalled();

        for (const checkbox of checkboxes) {
            await checkbox.toggle();
        }
        checkboxes = await getAllCheckboxes({ fixture, checked: true });

        expect(checkboxes).toHaveLength(2);
        expect(selectedDocumentSpy).toHaveBeenCalledTimes(2);
        expect(selectedDocuments).toEqual(jestMocks.nestedDocumentAncestors);
    });

    it("shouldn't select any node in the tree if the input document is unknown", async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(3);

        nodes.forEach(async (node) => {
            expect(node).not.toBeNull();
            expect(await (await node.host()).hasClass('hxp-selected')).toBe(false);
        });

        component.documents = [jestMocks.fileDocument];
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        nodes.forEach(async (node) => {
            expect(node).not.toBeNull();
            expect(await (await node.host()).hasClass('hxp-selected')).toBe(false);
        });
    });

    it('should pass accessibility checks', async () => {
        const res = await a11yReport('.hxp-fill');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });

    it('should pass accessibility checks for context menu', async () => {
        spyOn((component as any).uiDocumentTree, 'hasVisibleActions').and.returnValue(true);
        fixture.detectChanges();

        spyOn((component as any).uiDocumentTree, 'onContextMenu');
        jest.spyOn(mockSingleItemDownloadButtonActionService, 'isAvailable').mockReturnValue(true);
        jest.spyOn(mockDeleteButtonActionService, 'isAvailable').mockReturnValue(true);

        const element = fixture.debugElement.query(By.css('.hxp-context-btn button')).nativeElement;
        element.click();

        fixture.detectChanges();

        const res = await a11yReport('.hxp-context-menu');

        expect(res?.incomplete).toEqual(EXPECTED_CONTEXT_INCOMPLETE_VIOLATIONS);
        expect(res?.violations).toEqual(EXPECTED_CONTEXT_VIOLATIONS);
    });
});
