/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';

export interface FeatureDescription {
    name: string;
    description: string;
}

export type FeaturesInfo<T> = {
    [key in keyof T]: FeatureDescription;
};

export interface Environment<T> {
    production: boolean;
    devTools: boolean;
    e2e: boolean;
    features: {
        [Property in keyof T]: boolean
    };
}

@Injectable()
export class EnvironmentService<T> {
    constructor(private config: Environment<T>, private featuresInfo: FeaturesInfo<T> ) {}

    isProduction() {
        return this.config.production;
    }

    isFeatureActive(feature: keyof T) {
        return this.config.features[feature];
    }

    describeFeatures() {
        return Object.keys(this.featuresInfo)
            .map<FeatureDescription & {active: boolean}>(key => ({
            active: this.config.features[key],
            ...this.featuresInfo[key]
        }));
    }
}
