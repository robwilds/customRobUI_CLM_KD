/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldVerificationContextTaskService } from '../../services/context-task/field-verification-context-task.service';
import { ExtractionViewComponent } from '../extraction-view/extraction-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'hyland-idp-field-verification-root',
    templateUrl: './field-verification-root.component.html',
    styleUrls: ['./field-verification-root.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExtractionViewComponent, CommonModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
})
export class FieldVerificationRootComponent implements OnDestroy {
    screenLoading$: Observable<boolean>;
    taskCanSave$: Observable<boolean>;
    taskCanComplete$: Observable<boolean>;

    constructor(private readonly contextService: FieldVerificationContextTaskService, private readonly destroyRef: DestroyRef) {
        this.screenLoading$ = this.contextService.screenReady$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((ready) => !ready)
        );
        this.taskCanSave$ = this.contextService.taskCanSave$.pipe(takeUntilDestroyed(this.destroyRef));
        this.taskCanComplete$ = this.contextService.taskCanComplete$.pipe(takeUntilDestroyed(this.destroyRef));
    }

    ngOnDestroy(): void {
        this.contextService.destroy();
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.onShortcutKey(event);
    }

    onSubmit(): void {
        this.contextService.completeTask();
    }

    onSave(): void {
        this.contextService.saveTask();
    }

    private onShortcutKey(event: KeyboardEvent): boolean {
        if (event.repeat || event.defaultPrevented) {
            return true;
        }
        return false;
    }
}
