/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, Input, OnChanges, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ActionContext, DocumentService } from '@alfresco/adf-hx-content-services/services';
import { CreateDocumentVersionActionService } from './document-version.service';
import { filter, map } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { BetaChipTagComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-create-version',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatChipsModule, MatMenuModule, MatIconModule, TranslateModule, BetaChipTagComponent],
    templateUrl: './document-version.component.html',
    styleUrls: ['./document-version.component.scss'],
})
export class CreateDocumentVersionButtonComponent implements OnChanges, OnInit {
    @Input() isAvailable = false;
    @Input() data: ActionContext = { documents: [] };

    private createDocumentVersionService = inject(CreateDocumentVersionActionService);
    private documentService = inject(DocumentService);
    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        /**
         * Once HXCS-5714 is tackled, we don't need to listen to the documentUpdated$ event anymore.
         * Changes in actionContext should be enough to trigger the availability of the action.
         * TODO: https://hyland.atlassian.net/browse/HXCS-5714
         */
        this.documentService.documentUpdated$
            .pipe(
                filter((response) => !!response.document),
                map((response) => ({ documents: [response.document] })),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (data) => {
                    this.data = data;
                    this.updateAvailability();
                },
                error: console.error,
            });
    }

    ngOnChanges(): void {
        this.updateAvailability();
    }

    private updateAvailability(): void {
        this.isAvailable = this.createDocumentVersionService.isAvailable(this.data);
    }

    protected createVersion(): void {
        this.createDocumentVersionService.execute(this.data);
    }
}
