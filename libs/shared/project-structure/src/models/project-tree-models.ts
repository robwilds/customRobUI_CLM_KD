/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const ProjectTreeModelType = {
    processes: 'process',
    forms: 'form',
    formWidgets: 'custom-form-widget',
    authentication: 'authentication',
    connectors: 'connector',
    decisionTables: 'decision',
    ui: 'ui',
    files: 'file',
    scripts: 'script',
    triggers: 'trigger',
    dataModels: 'data',
};
export type ProjectTreeModelType = typeof ProjectTreeModelType[keyof typeof ProjectTreeModelType];

export const ProjectTreeStudioModels = {
    schemas: 'hxp_schema',
    mixins: 'hxp_mixin',
    contentTypes: 'hxp_doc_type',
    rendition: 'rendition',
    securityPolicy: 'security_policy',
    idpConfiguration: 'idp_configuration',
    ...ProjectTreeModelType,
};
export type ProjectTreeStudioModels = typeof ProjectTreeStudioModels[keyof typeof ProjectTreeStudioModels];

export const ProjectTreeModelingModels = {
    contentModels: 'model',
    ...ProjectTreeModelType,
};
export type ProjectTreeModelingModels = typeof ProjectTreeModelingModels[keyof typeof ProjectTreeModelingModels];
