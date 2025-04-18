/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { IdpTaskInfoBase } from '../../models/common-models';
import { TemplateLetDirective } from '../../directives/template-let.directive';

@Component({
    selector: 'hyland-idp-task-header',
    templateUrl: './task-header.component.html',
    styleUrls: ['./task-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatIconModule, TemplateLetDirective, TranslateModule],
})
export class TaskHeaderComponent {
    headerInfo$: Observable<IdpTaskInfoBase>;

    private readonly destroyRef = inject(DestroyRef);
    private readonly contextTaskService = inject(IdpContextTaskBaseService);

    constructor() {
        this.headerInfo$ = this.contextTaskService.taskInfo$.pipe(
            filter((task) => !!task),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    goBack() {
        this.contextTaskService.cancelTask();
    }

    generateAutomationId(label: string): string {
        if (!label) {
            return '';
        }
        return 'header-' + label.toLowerCase().replace(/ /g, '-');
    }
}
