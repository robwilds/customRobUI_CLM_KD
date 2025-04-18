/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';

// TODO: this is only a placeholder component to be removed when the governance services extension is implemented
@Component({
    selector: 'hxp-governance-services-extension',
    standalone: true,
    imports: [FeaturesDirective],
    templateUrl: './governance-services-extension.component.html',
})
export class GovernanceServicesExtensionComponent {
    protected governanceFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_GOVERNANCE_WORKSPACE_EXTENSION;
}
