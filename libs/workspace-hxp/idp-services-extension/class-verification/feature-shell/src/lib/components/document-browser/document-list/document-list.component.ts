/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { IdpDocument } from '../../../models/screen-models';
import { CommonModule } from '@angular/common';
import { ListItemComponent } from '../../list-item/list-item.component';
import {
    IdpKeyboardNavAction,
    IdpKeyboardNavActionTypeInternal,
    IdpKeyboardNavClickEvent,
    IdpKeyboardNavContextIdentifier,
    IdpKeyboardNavEvent,
    IdpKeyboardNavigationService,
    isSameContext,
} from '../../../services/document/idp-keyboard-navigation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { IdpDocumentMultiselectService } from '../../../services/document/idp-document-multiselect.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageListComponent } from '../page-list/page-list.component';
import { MatButtonModule } from '@angular/material/button';
import { IdpShortcutAction, TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DragPlaceholderMetadata, IdpDocumentDragDropService } from '../../../services/document/idp-drag-drop.service';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { IdpNavSelectionType } from '../../../models/common-models';
import { MatTooltipModule } from '@angular/material/tooltip';

type DocumentData = IdpDocument & { allPagesSelected: boolean };

@Component({
    selector: 'hyland-idp-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatTooltipModule,
        MatListModule,
        CommonModule,
        DragDropModule,
        MatBadgeModule,
        ListItemComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        PageListComponent,
        TemplateLetDirective,
    ],
})
export class DocumentListViewComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() classId!: string;
    @Input() previewMode? = false;
    @Output() collapseContainer = new Subject();
    @ViewChildren(ListItemComponent) items!: QueryList<ListItemComponent>;

    private keydownEvent$ = new Subject<IdpKeyboardNavEvent>();
    private clickEvent$ = new Subject<IdpKeyboardNavClickEvent>();
    private pendingMouseUpToggle: { selectionAction: IdpNavSelectionType } | undefined = undefined;

    documents$: Observable<DocumentData[]> = of([]);
    isPageDragging$: Observable<boolean> = of(false);

    readonly documentUniquenessFn = (i: number, document: IdpDocument) => document.id;
    readonly dragPlaceholderMetadata$: Observable<DragPlaceholderMetadata>;

    classDropListId!: string;
    draggingDocuments: IdpDocument[] = [];

    constructor(
        private readonly documentService: IdpDocumentService,
        private readonly keyboardNavigationService: IdpKeyboardNavigationService,
        private readonly documentMultiselectService: IdpDocumentMultiselectService,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly destroyRef: DestroyRef,
        private readonly dragDropService: IdpDocumentDragDropService
    ) {
        this.isPageDragging$ = this.dragDropService.isDragging$.pipe(takeUntilDestroyed(this.destroyRef));

        this.keyboardNavigationService.action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action) => {
            this.onNavigationAction(action);
        });

        this.dragPlaceholderMetadata$ = this.dragDropService.dragPlaceholderMetadata$;

        this.classDropListId = `class-${this.classId}-drop-list`;
    }

    ngOnInit(): void {
        this.dragDropService.addDropList(this.classDropListId);
        this.documents$ = this.documentService.getDocumentsForClass(this.classId).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((documents) => {
                return documents.map((document) => ({
                    ...document,
                    allPagesSelected: document.pages.every((page) => page.isSelected),
                }));
            })
        );
    }

    ngAfterViewInit() {
        if (!this.previewMode) {
            this.keyboardNavigationService.registerContext({
                ...this.keyboardNavContext,
                items: this.items,
                itemType: 'document',
                keydownEvent$: this.keydownEvent$,
                clickEvent$: this.clickEvent$,
                canExpand: true,
                activateItemOnRegister: true,
                multiSelectAllowed: true,
            });
        }
    }

    ngOnDestroy() {
        this.dragDropService.removeDropList(this.classDropListId);
        if (!this.previewMode) {
            this.keyboardNavigationService.unregisterContext(this.keyboardNavContext);
        }
    }

    onItemMouseDown(item: IdpDocument, event: MouseEvent, mode: 'toggle' | 'select') {
        this.clickEvent$.next({
            itemContext: { contextId: item.id, contextType: 'document' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });

        this.onItemListChanged(item, event, mode);
    }

    onItemMouseUp(item: DocumentData, event: MouseEvent) {
        if (this.pendingMouseUpToggle && (event.ctrlKey || event.metaKey)) {
            this.documentMultiselectService.documentSelected(item.id, this.pendingMouseUpToggle.selectionAction, true);
        }

        this.pendingMouseUpToggle = undefined;
    }

    onDragStarted() {
        this.documentService.selectedDocuments$.pipe(take(1)).subscribe((documents) => {
            this.draggingDocuments = documents;
            this.dragDropService.setDraggingObject({ documents: documents });
            for (const document of documents) {
                this.documentService.toggleDraggedDocument(document.id);
            }
        });
        this.dragDropService.setDraggingState(true);
    }

    onDragStopped() {
        this.draggingDocuments = [];
        this.documentService.selectedDocuments$.pipe(take(1)).subscribe((documents) => {
            for (const document of documents) {
                this.documentService.toggleDraggedDocument(document.id);
            }
        });
        this.dragDropService.setDraggingState(false);
    }

    onItemKeyDown(item: IdpDocument, event: KeyboardEvent): void {
        this.keydownEvent$.next({
            itemContext: { contextId: item.id, contextType: 'document' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });
    }

    onMouseEnter(item: IdpDocument): void {
        combineLatest([this.dragDropService.isDragging$, this.dragDropService.draggingObject$])
            .pipe(take(1))
            .subscribe(([isDragging, draggingObject]) => {
                if (!isDragging) {
                    return;
                }

                if (draggingObject?.pages) {
                    this.documentService.togglePreviewedDocument(item.id);
                }

                this.dragDropService.setDraggingTarget({ document: item });
            });
    }

    onContainerKeyDown(items: IdpDocument[], event: KeyboardEvent) {
        if (items.length > 0) {
            this.onItemKeyDown(items[0], event);
        }
    }

    toggleList(item: IdpDocument, forceOp: 'expand' | 'collapse' | 'toggle' = 'toggle') {
        if (forceOp === 'expand' && item.isExpanded) {
            return;
        }
        if (forceOp === 'collapse' && !item.isExpanded) {
            return;
        }

        item.isExpanded = !item.isExpanded;

        this.documentService.toggleExpandDocument(item.id);
    }

    onPageCollapseRequest(item: IdpDocument) {
        this.toggleList(item, 'collapse');
    }

    private onItemListChanged(item: IdpDocument, event: MouseEvent | undefined, mode: 'toggle' | 'select'): void {
        event?.stopImmediatePropagation();
        event?.preventDefault();
        this.toggleList(item, mode === 'toggle' ? 'toggle' : 'expand');
    }

    private selectAllDocuments() {
        this.documentMultiselectService.selectAll('document');
    }

    private onNavigationAction(action: IdpKeyboardNavAction) {
        const isValidContext = action.itemContext?.contextType === 'document' && isSameContext(action.containerContext, this.keyboardNavContext);
        const item = action.data as IdpDocument;
        if (!isValidContext || !item) {
            return;
        }

        switch (action.type) {
            case IdpShortcutAction.SelectAllContextOnly: {
                this.selectAllDocuments();
                break;
            }
            case IdpKeyboardNavActionTypeInternal.Expand: {
                this.toggleList(item, 'expand');
                break;
            }
            case IdpShortcutAction.Collapse:
            case IdpKeyboardNavActionTypeInternal.Collapse: {
                if (item?.isExpanded) {
                    this.toggleList(item, 'collapse');
                } else {
                    this.collapseContainer.next({});
                }
                break;
            }
        }

        const activeItemId = action.currentActiveInfo?.id;
        if (!activeItemId) {
            return;
        }

        switch (action.selectionAction) {
            case 'none': {
                if (action.currentActiveInfo?.activeContext?.contextType === 'root') {
                    this.documentMultiselectService.clearSelection();
                    this.changeDetector.detectChanges();
                }
                break;
            }
            default: {
                this.pendingMouseUpToggle =
                    item.isSelected === true && action.selectionAction === 'multi' ? { selectionAction: action.selectionAction } : undefined;
                this.documentMultiselectService.documentSelected(activeItemId, action.selectionAction);
                this.changeDetector.detectChanges();
                break;
            }
        }
    }

    private get keyboardNavContext(): IdpKeyboardNavContextIdentifier {
        return {
            contextId: this.classId,
            contextType: 'class',
        };
    }

    isElementContained(el: HTMLElement) {
        return el.offsetWidth >= el.scrollWidth;
    }
}
