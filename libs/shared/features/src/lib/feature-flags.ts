/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const STUDIO_HXP = {
    STUDIO_CONTENT_MODEL_IMPROVEMENTS: 'studio-content-model-constraints-improvements',
    ONBASE_CONNECTOR: 'studio-onbase-connector',
    ACS_CONNECTOR: 'studio-acs-connector',
    PERCEPTIVE_CONNECTOR: 'studio-perceptive-connector',
    CONTENT_DOWNLOAD_URL: 'content-external-uri-blob-creation',
    ATTACH_FILE_WIDGET_DEFAULT_FOLDER: 'studio-attach-file-widget-default-folder',
    SECURITY_POLICY_API: 'content-security-policy',
    STUDIO_SET_PERMISSIONS_ON_CONTENT_CREATION: 'studio-set-permissions-content-creation',
    STUDIO_LINK_EVENTS_SUPPORT: 'studio-bpmn-link-events',
    // eslint-disable-next-line @cspell/spellchecker
    MS_MAIL_CONNECTOR: 'studio-msmail-connector',
    OPEN_AI_CONNECTOR: 'studio-open-ai-connector',
    BUILD_PROCESSES_VIA_CHAT_PROMPT: 'studio-build-processes-via-chat-prompt',
    STUDIO_IDP_SCREENS_SUPPORT: 'studio-idp-screens-support',
    CONTENT_FEDERATED_CONNECTOR: 'studio-fcc-connector',
    BUILD_FORMS_VIA_CHAT_PROMPT: 'studio-build-forms-via-chat-prompt',
} as const;
export type STUDIO_HXP = typeof STUDIO_HXP[keyof typeof STUDIO_HXP];

export const STUDIO_SHARED = {
    STUDIO_DECIMAL_NUMBERS: 'studio-decimal-numbers',
    ENABLE_LOCALISATION: 'studio-enable-localisation',
    FORM_CENTRIC_VIEW: 'studio-form-centric-view',
    STUDIO_FORM_PROCESS_DEPENDENCY: 'studio-form-process-dependency',
    STUDIO_FILTERS_REDESIGN: 'studio-filters-redesign',
    STUDIO_PROCESS_VARIABLES_FILTERS: 'studio-process-variables-filters',
    STUDIO_GROUP_FORM_ELEMENTS: 'studio-group-form-elements',
    STUDIO_FORM_DYNAMIC_QUERY: 'studio-form-dynamic-query',
    STUDIO_LARGE_PROCESS_VARIABLES: 'studio-large-process-variables',
    STUDIO_LEFT_PANEL_USABILITY_IMPROVEMENT: 'studio-left-panel-usability-improvement',
    STUDIO_AUTO_OPEN_NEXT_USER_TASK: 'studio-auto-open-next-user-task',
    STUDIO_CALCULATIONS_ON_FORM_FIELDS: 'studio-calculations-on-form-fields',
    STUDIO_IMPLEMENT_UI_FORM_ENRICHMENT: 'studio-implement-ui-form-enrichment',
    STUDIO_ANONYMOUS_PROCESS_START: 'studio-anonymous-process-start',
} as const;
export type STUDIO_SHARED = typeof STUDIO_SHARED[keyof typeof STUDIO_SHARED];

export const ADMIN_HXP = {
    CONNECTOR_LOGS_VIEWER: 'studio-admin-connector-logs-viewer',
    STUDIO_ADMIN_ANALYTICS_DASHBOARD: 'studio-admin-analytics-dashboard',
    STUDIO_LARGE_PROCESS_VARIABLES: 'studio-large-process-variables',
} as const;
export type ADMIN_HXP = typeof ADMIN_HXP[keyof typeof ADMIN_HXP];

export const ADMIN_SHARED = {
    ENABLE_REDEPLOY: 'studio-enable-redeploy',
    STUDIO_MANAGE_CONNECTORS: 'studio-manage-connectors',
} as const;
export type ADMIN_SHARED = typeof ADMIN_SHARED[keyof typeof ADMIN_SHARED];

export const IDP = {
    PROMPT_BASED_CONFIG: 'idp-prompt-based-configuration',
    CONFIGURABLE_REVIEW_AND_VERIFICATION: 'idp-configurable-review-and-verification',
    CONFIGURATION_ONBASE_CONNECTION: 'idp-configuration-onbase-connection',
} as const;

export const CICGOV = {
    CONFIGURATION: 'cic-governance-configuration',
} as const;
