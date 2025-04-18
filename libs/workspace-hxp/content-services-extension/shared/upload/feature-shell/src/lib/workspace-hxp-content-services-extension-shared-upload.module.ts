/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentUploadDragAreaComponent } from './upload-drag/hxp-content-upload-drag-area.component';
import { HxpUploadModule } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';

@NgModule({
    imports: [CommonModule, HxpUploadModule],
    declarations: [ContentUploadDragAreaComponent],
    exports: [ContentUploadDragAreaComponent],
})
export class WorkspaceHxpContentServicesExtensionSharedUploadModule {}
