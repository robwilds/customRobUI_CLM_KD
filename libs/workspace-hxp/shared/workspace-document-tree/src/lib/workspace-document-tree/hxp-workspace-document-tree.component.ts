/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    ContextActionConfiguration,
    DocumentService,
    DocumentTreeDatabaseService,
    DocumentTreeNode,
} from '@alfresco/adf-hx-content-services/services';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslateModule } from '@ngx-translate/core';
import { merge, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HxpDocumentTreeComponent } from '@alfresco/adf-hx-content-services/ui';

@Component({
    selector: 'hxp-workspace-document-tree',
    templateUrl: './hxp-workspace-document-tree.component.html',
    standalone: true,
    imports: [NgIf, NgFor, MatMenuModule, MatIconModule, TranslateModule, HxpDocumentTreeComponent],
})
export class HxpWorkspaceDocumentTreeComponent implements AfterViewInit, OnDestroy {
    @Input()
    documents: Document[] = [];

    @Input()
    multiSelection = false;

    @Output()
    selectedDocument = new EventEmitter<Document>();

    @ViewChild(HxpDocumentTreeComponent)
    private uiDocumentTree!: HxpDocumentTreeComponent;

    private dataSource!: DocumentTreeDatabaseService;
    private destroyed$: Subject<void> = new Subject<void>();

    constructor(private documentService: DocumentService) {}

    ngAfterViewInit(): void {
        this.dataSource = this.uiDocumentTree.dataSource;

        this.documentService.documentDeleted$
            .pipe(
                map((docId) => this.dataSource.findNodeByDocumentId(docId)),
                filter((node): node is DocumentTreeNode & { document: Document } => !!node?.document),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: (nodeToDelete) => {
                    if (nodeToDelete?.document.sys_parentId === ROOT_DOCUMENT.sys_id) {
                        this.dataSource.deleteNode(nodeToDelete as DocumentTreeNode);
                    } else {
                        this.dataSource.refreshNode(nodeToDelete?.document.sys_parentId);
                    }
                },
                error: (err) => {
                    console.error(err);
                },
            });

        this.documentService.documentCreated$
            .pipe(
                map((newDocument) => {
                    const parentNode = this.dataSource.findNodeByDocumentId(newDocument.sys_parentId);
                    return { parentNode, newDocument };
                }),
                filter(({ parentNode }) => !!parentNode),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: ({ newDocument }) => {
                    this.dataSource.refreshNode(newDocument.sys_parentId);
                },
                error: (err) => {
                    console.error(err);
                },
            });

        this.documentService.documentUpdated$
            .pipe(
                map((updateInfo) => updateInfo.document),
                filter((updatedDocument): updatedDocument is Document => !!updatedDocument),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: (updatedDocument) => {
                    if (updatedDocument.sys_parentId === ROOT_DOCUMENT.sys_id) {
                        this.dataSource.updateNode(updatedDocument);
                    } else {
                        this.dataSource.refreshNode(updatedDocument.sys_parentId);
                    }
                },
                error: (err) => {
                    console.error(err);
                },
            });

        merge(this.documentService.documentCopied$, this.documentService.documentMoved$)
            .pipe(
                switchMap(() => {
                    // for now we only support single selection for these actions
                    if (!this.multiSelection && this.documents[0]?.sys_id) {
                        return this.documentService.getAncestors(this.documents[0].sys_id).pipe(catchError(() => of([{ ...ROOT_DOCUMENT }])));
                    }

                    return of([{ ...ROOT_DOCUMENT }]);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe({
                next: (ancestors) => {
                    const lastAncestor = ancestors[ancestors.length - 1];

                    if (lastAncestor.sys_id !== ROOT_DOCUMENT.sys_id) {
                        const lastAncestorNode = this.dataSource.findNodeByDocumentId(lastAncestor.sys_id);
                        if (lastAncestorNode) {
                            this.dataSource.toggleNode(lastAncestorNode, { expand: true });
                        }
                        this.openNodes(ancestors);
                    } else {
                        this.dataSource.refreshNode(ROOT_DOCUMENT.sys_id);
                    }
                },
            });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onSelectedDocument(document: Document) {
        this.selectedDocument.emit(document);
    }

    onMenuItemClick(menuItem: ContextActionConfiguration) {
        if (menuItem?.model?.visible) {
            menuItem.subject.next(menuItem);
        }
    }

    private openNodes(documents: (Document | undefined)[]) {
        if (!this.multiSelection && Array.isArray(documents) && documents.length > 0) {
            this.dataSource.openNodes(documents);
        }
    }
}
