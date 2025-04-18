/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterViewInit, Directive, inject, Input, OnDestroy, TemplateRef } from '@angular/core';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { isValidLayerType, ViewerLayerType } from '../models/viewer-layer';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';

@Directive({
    selector: '[hylandIdpViewerContentLayer]',
    standalone: true,
    providers: [ViewerTextLayerService],
})
export class ViewerContentLayerDirective implements AfterViewInit, OnDestroy {
    @Input('hylandIdpViewerContentLayer') viewerContentLayer!: ViewerLayerType;
    private readonly templateRef: TemplateRef<unknown> = inject(TemplateRef);
    private readonly viewerLayerService: ViewerLayerService = inject(ViewerLayerService);

    constructor() {}

    ngAfterViewInit(): void {
        if (!this.viewerContentLayer || !isValidLayerType(this.viewerContentLayer)) {
            throw new Error(
                `${this.viewerContentLayer} is not a valid layer type for the content layer.
        Valid types are: ${Object.keys(ViewerLayerType).join(',')}`
            );
        }

        this.viewerLayerService.registerLayer({
            type: this.viewerContentLayer,
            templateRef: this.templateRef,
        });
    }

    ngOnDestroy(): void {
        this.viewerLayerService.unregisterLayer(this.viewerContentLayer);
    }
}
