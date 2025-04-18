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
import { IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { ClassListComponent } from '../document-browser/class-list/class-list.component';
import { ClassVerificationViewerComponent } from '../class-verification-viewer/class-verification-viewer.component';
import { ClassVerificationContextTaskService } from '../../services/context-task/class-verification-context-task.service';
import { TaskHeaderComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'hyland-idp-class-verification-root',
    templateUrl: './class-verification-root.component.html',
    styleUrls: ['./class-verification-root.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ClassListComponent,
        ClassVerificationViewerComponent,
        CommonModule,
        TaskHeaderComponent,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslateModule,
    ],
})
export class ClassVerificationRootComponent implements OnDestroy {
    screenLoading$: Observable<boolean>;
    taskCanSave$: Observable<boolean>;
    taskCanComplete$: Observable<boolean>;

    constructor(
        private readonly contextService: ClassVerificationContextTaskService,
        private readonly documentToolbarService: IdpDocumentToolbarService,
        private readonly destroyRef: DestroyRef
    ) {
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
        if (event.repeat) {
            event.preventDefault();
            return true;
        }
        return !this.documentToolbarService.handleShortcutAction(event);
    }
}
