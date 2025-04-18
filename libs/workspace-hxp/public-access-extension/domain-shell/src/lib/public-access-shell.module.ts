/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { PublicFormComponent, SubmissionSuccessComponent, submissionSuccessGuard } from '@hxp/workspace-hxp/public-access-extension/public-forms';
import { PublicAccessShellComponent } from './components/public-access-shell/public-access-shell.component';
import { ErrorContentComponent } from '@alfresco/adf-core';

@NgModule({
    providers: [provideExtensionConfig(['public-access.extension.json'])],
})
export class PublicAccessShellModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'public-access.shell.main-content': PublicAccessShellComponent,
            'public-access.shell.error': ErrorContentComponent,
            'public-access.forms': PublicFormComponent,
            'public-access.forms.success': SubmissionSuccessComponent,
        });

        extensions.setAuthGuards({
            'public-access.forms.success.auth': submissionSuccessGuard,
        });
    }
}
