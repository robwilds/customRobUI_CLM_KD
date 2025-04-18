/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtensionActionsHandler } from '../extensions/extensions-actions-handler.service';

@Component({
    standalone: false,
    selector: 'hxp-main-action-button',
    templateUrl: './main-action-button.component.html',
    styleUrls: ['./main-action-button.component.scss'],
})
export class MainActionButtonComponent {
    mainAction$: Observable<ContentActionRef | undefined>;

    constructor(private extensionService: ExtensionService, private extensionActionsHandler: ExtensionActionsHandler) {
        this.mainAction$ = this.extensionService.setup$.pipe(map(() => this.extensionService.getFeature<ContentActionRef>('mainAction')));
    }

    runAction(actionId: string): void {
        this.extensionActionsHandler.runActionById(actionId);
    }
}
