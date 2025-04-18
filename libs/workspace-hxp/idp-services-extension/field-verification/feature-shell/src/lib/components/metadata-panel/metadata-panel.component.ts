/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    ViewEncapsulation,
    ViewChildren,
    QueryList,
    ElementRef,
    AfterViewInit,
    DestroyRef,
    OnDestroy,
    EventEmitter,
    Output,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { ExtractionResultComponent } from '../extraction-result/extraction-result.component';
import { ActionHistoryService } from '../../services/action-history.service';
import { IdpDocument, IdpField } from '../../models/screen-models';
import { BasicOcrWord, findSingleTypeaheadMatch, IdpVerificationService } from '../../services/verification/verification.service';
import { RejectDocumentDialogComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hyland-idp-extraction-metadata-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ExtractionResultComponent,
        TranslateModule,
    ],
    templateUrl: './metadata-panel.component.html',
    styleUrls: ['./metadata-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MetadataPanelComponent implements AfterViewInit, OnDestroy {
    readonly document$: Observable<IdpDocument>;

    @ViewChildren('metadataInput') metadataInputs!: QueryList<ElementRef<HTMLInputElement>>;

    private readonly viewInitialized$ = new BehaviorSubject<boolean>(false);
    private programmaticFocus = true;
    private lastKeyDownEvent?: KeyboardEvent;

    @Input()
    ocrWords = new Array<BasicOcrWord>();

    @Output()
    readonly fieldValuePending = new EventEmitter<{ field: IdpField; pendingValue: string }>();

    constructor(
        readonly dialog: MatDialog,
        private readonly injector: Injector,
        private readonly history: ActionHistoryService,
        private readonly verificationService: IdpVerificationService,
        destroyRef: DestroyRef
    ) {
        this.document$ = this.verificationService.document$.pipe(takeUntilDestroyed(destroyRef));
        this.verificationService.activeField$
            .pipe(
                takeUntilDestroyed(destroyRef), // Unsubscribe when the component is destroyed
                switchMap((field) =>
                    this.viewInitialized$.pipe(
                        filter((v) => v), // Proceed only when the view is initialized
                        map(() => field) // Map to the current field
                    )
                )
            )
            .subscribe((field) => {
                if (this.programmaticFocus) {
                    // setTimeout prevents ExpressionChangedAfterItHasBeenCheckedError in test
                    setTimeout(() => this.metadataInputs.find((input) => input.nativeElement.id === field?.id)?.nativeElement.focus(), 0);
                    this.programmaticFocus = false;
                }
            });
    }

    ngAfterViewInit() {
        this.viewInitialized$.next(true);
    }

    ngOnDestroy() {
        this.viewInitialized$.next(false);
    }

    openRejectDocumentDialog() {
        const dialogConfig: MatDialogConfig = {
            injector: this.injector,
            width: '600px',
            height: '80%',
            autoFocus: '.idp-filterable-selection-list__search-field-input',
            restoreFocus: true,
        };
        const dialogRef = this.dialog.open(RejectDocumentDialogComponent, dialogConfig);
        return dialogRef.afterClosed().subscribe((result) => {
            if (result?.rejectReason) {
                this.verificationService.updateRejectReason(result.rejectReason.id, result.rejectNote);
            }
        });
    }

    canUndo() {
        return this.history.canUndo();
    }
    onUndo() {
        this.history.undo();
    }

    canRedo() {
        return this.history.canRedo();
    }
    onRedo() {
        this.history.redo();
    }

    onFieldKeyDown(event: KeyboardEvent, field: IdpField, value: string) {
        this.lastKeyDownEvent = event;
        // keyboard shortcuts should not propagate to parent components
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            this.confirmFieldUpdate(field, value);
            this.programmaticFocus = true;
            this.verificationService.selectNextField();
        }
    }

    onFieldFocus(field: IdpField) {
        // needed to make sure that the activeField in the store stays in sync
        this.programmaticFocus = false;
        this.verificationService.selectField(field);
        this.fieldValuePending.emit({ field, pendingValue: field.value ?? '' });
    }

    onFieldInput(field: IdpField, input: HTMLInputElement) {
        // if the user is deleting text, we don't want to auto-complete
        const isDismissal = this.lastKeyDownEvent?.key === 'Backspace' || this.lastKeyDownEvent?.key === 'Delete';
        if (!isDismissal) {
            const userValue = input.value;
            const suggestion = findSingleTypeaheadMatch(this.ocrWords, userValue);
            if (suggestion) {
                input.value = suggestion.map((word) => word.text).join(' ');
                input.setSelectionRange(userValue.length, input.value.length);
            }
        }

        this.fieldValuePending.emit({ field, pendingValue: input.value });
    }

    onFieldFocusOut(field: IdpField, value: string): void {
        this.confirmFieldUpdate(field, value);
    }

    private confirmFieldUpdate(field: IdpField, value: string) {
        if ((field.value ?? '') === value) {
            // same value is an update (field is ManuallyReviewed), but not an undoable action
            this.verificationService.updateField(field);
        } else {
            const updatedField = { ...field, value };
            this.history.do({
                do: () => this.verificationService.updateField(updatedField),
                undo: () => this.verificationService.updateField(field),
            });
        }
    }

    // This custom trackBy function prevents Angular from re-rendering the entire list of fields on each change, which can cause focus loss.
    // The implementation might need to be updated if the number or ordering of fields could change.
    // https://github.com/ngrx/store/issues/176
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackField(index: number, field: IdpField) {
        return index;
    }
}
