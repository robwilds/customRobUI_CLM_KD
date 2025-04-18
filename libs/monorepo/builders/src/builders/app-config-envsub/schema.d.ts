/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { type EnvSetting } from '@alfresco-dbp/monorepo/core';

export interface AppConfigEnvsubExecutorSchema {
    application: string;
    externalScript: string;
    projectName?: string;
    envs?: EnvSetting[];
}
