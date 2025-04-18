/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const OOBConnectors = {
    COMPREHEND: 'comprehendConnector',
    CONTENT: 'contentConnector',
    DOCGEN: 'docgenConnector',
    DOCUSIGN: 'docusignConnector',
    EMAIL: 'emailConnector',
    LAMBDA: 'lambdaConnector',
    REKOGNITION: 'rekognitionConnector',
    REST: 'restConnector',
    SALESFORCE: 'salesforceConnector',
    SLACK: 'slackConnector',
    TEXTRACT: 'textractConnector',
    TWILIO: 'twilioConnector',
    MARIADB: 'mariadbConnector',
    POSTGRESQL: 'postgresqlConnector',
    SQLSERVER: 'sqlserverConnector',
    TRANSCRIBE: 'transcribeConnector',
    CALENDAR: 'calendarConnector',
    TEAMS: 'teamsConnector',
    ONBASE: 'onBaseConnector',
    ACS: 'acsConnector',
    PERCEPTIVE: 'perceptiveConnector',
    NUXEO: 'nuxeoConnector',
    USER_ATTRIBUTES: 'userAttributesConnector',
    HXP_CONTENT: 'hxpContentService',
    MICROSOFT_EMAIL: 'msMailConnector',
    OPEN_AI: 'openAIConnector',
    HXP_IDP: 'hxpIdpConnector',
    CONTENT_FEDERATED: 'contentFederatedConnector',
} as const;

export type OOBConnectors = typeof OOBConnectors[keyof typeof OOBConnectors];
