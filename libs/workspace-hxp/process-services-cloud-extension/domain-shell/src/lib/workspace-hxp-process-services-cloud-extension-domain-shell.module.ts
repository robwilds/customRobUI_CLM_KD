/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessServicesCloudExtensionProcessFormFeatureShellModule } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/process-form/feature-shell';

@NgModule({
    imports: [CommonModule, ProcessServicesCloudExtensionProcessFormFeatureShellModule],
})
export class ProcessServicesCloudExtensionDomainShellModule {}
