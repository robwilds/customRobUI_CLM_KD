/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { DockerDeploySchema } from './schema';
import { MonorepoController, MONOREPO_PROJECT_INFO_FILE } from '@alfresco-dbp/monorepo/core';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

enum ACTIONS {
    Publish = 'publish',
    Link = 'link',
}

function interpolateEnvVars(str: string) {
    return str?.replace(/(\$[a-zA-Z0-9_]*)/g, (_, variableName) => process.env[variableName.replace(/^\$/, '')]);
}

export async function commandBuilder(options: DockerDeploySchema, context: BuilderContext): Promise<BuilderOutput> {
    await context.getProjectMetadata(context.target);

    const QUAY_USERNAME = process.env['QUAY_USERNAME'];
    const QUAY_PASSWORD = process.env['QUAY_PASSWORD'];

    if (QUAY_USERNAME === undefined || QUAY_PASSWORD === undefined) {
        throw new Error(
            `Missing env variables: The docker username and deploy password are mandatory. Please check your env variables QUAY_USERNAME|QUAY_PASSWORD `
        );
    }

    const DOCKER_REPOSITORY_DOMAIN = options.repositoryDomain;
    const REPO_SLUG = options.repositorySlug;
    const SOURCE_TAG = options.sourceTag;
    const DOCKER_REPOSITORY = `${DOCKER_REPOSITORY_DOMAIN}/${REPO_SLUG}`;
    const dockerProjectArgs = ['--buildArgs', `PROJECT_NAME=${options.outputPath}`];

    options?.envVars?.forEach((envVar) => {
        dockerProjectArgs.push('--buildArgs');
        dockerProjectArgs.push(`${envVar.name}=${envVar.value}`);
    });

    const tagInterpolation = interpolateEnvVars(options.tag);

    context.logger.debug('DOCKER_REPOSITORY_DOMAIN: ' + DOCKER_REPOSITORY_DOMAIN);
    context.logger.debug('REPO_SLUG: ' + REPO_SLUG);
    context.logger.debug('ACTION: ' + options.action);
    context.logger.debug('FILE: ' + options.file);
    context.logger.debug('dryrun: ' + options.dryrun);

    const monorepoMetadata = await MonorepoController.getMonorepoProjectAsync(context.target.project);

    if (!monorepoMetadata.isDeployable()) {
        throw new Error(`;
                Missing;
                metatada: the;
                deploy;
                section;
                is;
                mandatory.Check;
                the; ${MONOREPO_PROJECT_INFO_FILE}
                on ${context.target.project}`);
    }

    let dockerCmdRes;
    if (options.action === ACTIONS.Publish) {
        const tags = tagInterpolation.split(',');
        context.logger.debug('TAGS: ' + `${tags}`);

        const filenameOption = [];
        if (options.file) {
            filenameOption.push('--fileName');
            filenameOption.push(options.file);
        }

        const dryRunOptional = [];
        if (options.dryrun) {
            dryRunOptional.push('--dryrun');
        }

        dockerCmdRes = spawnSync(
            'npx adf-cli',
            [
                'docker',
                '--target',
                ACTIONS.Publish,
                '--loginCheck',
                '--loginUsername',
                QUAY_USERNAME,
                '--loginPassword',
                QUAY_PASSWORD,
                '--loginRepo',
                DOCKER_REPOSITORY_DOMAIN,
                '--dockerRepo',
                DOCKER_REPOSITORY,
                '--dockerTags',
                `${tags}`,
                ...filenameOption,
                ...dockerProjectArgs,
                ...dryRunOptional,
            ],
            { cwd: resolve('./'), shell: true }
        );
    } else {
        dockerCmdRes = spawnSync(
            'npx adf-cli',
            [
                'docker',
                '--target',
                ACTIONS.Link,
                '--loginCheck',
                '--loginUsername',
                QUAY_USERNAME,
                '--loginPassword',
                QUAY_PASSWORD,
                '--loginRepo',
                DOCKER_REPOSITORY_DOMAIN,
                '--dockerRepo',
                DOCKER_REPOSITORY,
                '--dockerTags',
                `${[monorepoMetadata.releaseVersion, ...monorepoMetadata.tagAliases]}`,
                ...dockerProjectArgs,
                '--sourceTag',
                SOURCE_TAG,
            ],
            { cwd: resolve('./'), shell: true }
        );
    }

    if (dockerCmdRes.status === 0) {
        context.logger.info(dockerCmdRes.stdout.toString());
        return { success: true };
    } else {
        throw new Error(dockerCmdRes.stderr.toString());
    }
}

export default createBuilder<json.JsonObject & DockerDeploySchema>(commandBuilder) as any; // Since we are using an internal contract...
