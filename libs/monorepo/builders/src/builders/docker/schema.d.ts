/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface DockerDeploySchema extends json.JsonObject {
    action: string;
    tag: string;
    outputPath: string;
    envVars: [EnvVar];
    repositoryDomain: string;
    repositorySlug: string;
    sourceTag: string;
    file: string;
    dryrun: boolean;
}

export interface EnvVar {
    name: string;
    value: any;
}
