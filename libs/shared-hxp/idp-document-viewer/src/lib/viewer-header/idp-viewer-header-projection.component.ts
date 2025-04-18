/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'hyland-idp-viewer-header',
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdpViewerHeaderProjectionComponent {}
