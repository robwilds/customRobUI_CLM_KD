/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Environment, EnvironmentService, FeaturesInfo } from './environment.service';
import { InjectionToken } from '@angular/core';

export function createEnvironmentServices<T = any>(config: Environment<T>, featuresInfo: FeaturesInfo<T>) {
    return new EnvironmentService<T>(config, featuresInfo);
}

export const ENVIRONMENT_SERVICE_TOKEN = new InjectionToken<EnvironmentService<any>>('generic-environment-service');
