/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Directive,
    Inject,
    Input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { ENVIRONMENT_SERVICE_TOKEN } from '../../services/environment.provider';
import { EnvironmentService } from '../../services/environment.service';

@Directive({
    selector: '[adf-feature]',
    standalone: true
})
export class FeatureDirective<T> {
    private hasView = false;

    constructor(
        @Inject(ENVIRONMENT_SERVICE_TOKEN) private environmentService: EnvironmentService<T>,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) {}

    @Input('adf-feature') set adfFeature(featureName: keyof T) {
        if (this.environmentService.isFeatureActive(featureName) && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
