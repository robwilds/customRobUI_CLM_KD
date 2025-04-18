{
    "$schema": "../../../node_modules/@alfresco/adf-core/app.config.schema.json",
    "providers": "${APP_CONFIG_PROVIDER}",
    "ecmHost": "${APP_CONFIG_ECM_HOST}",
    "bpmHost": "${APP_CONFIG_BPM_HOST}",
    "authType": "OAUTH",
    "serverTimeUrl": "${APP_CONFIG_SERVER_TIME_URL}",
    "hxIdpHost": "",
    "oauth2": {
        "host": "${APP_CONFIG_OAUTH2_HOST}",
        "clientId": "${APP_CONFIG_OAUTH2_CLIENTID}",
        "authPath": "/protocol/openid-connect/token/",
        "scope": "${APP_CONFIG_OAUTH2_SCOPE}",
        "implicitFlow": ${APP_CONFIG_OAUTH2_IMPLICIT_FLOW},
        "codeFlow": ${APP_CONFIG_OAUTH2_CODE_FLOW},
        "silentLogin": ${APP_CONFIG_OAUTH2_SILENT_LOGIN},
        "publicUrls": ["**/blank"],
        "redirectSilentIframeUri": "${APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI}",
        "redirectUri": "${APP_CONFIG_OAUTH2_REDIRECT_LOGIN}",
        "redirectUriLogout": "${APP_CONFIG_OAUTH2_REDIRECT_LOGOUT}",
        "clockSkewInSec" : 120
    },
    "plugins": {
        "contentService": ${APP_CONFIG_PLUGIN_CONTENT_SERVICE}
    },
    "alfresco-deployed-apps": ${APP_CONFIG_APPS_DEPLOYED},
    "uiType": "${UI_TYPE}",
    "locale": "en",
        "languages": [
        {
            "key": "en",
            "label": "English"
        },
        {
            "key": "fr",
            "label": "Français"
        },
        {
            "key": "de",
            "label": "Deutsch"
        },
        {
            "key": "it",
            "label": "Italiano"
        },
        {
            "key": "es",
            "label": "Español"
        },
        {
            "key": "pl",
            "label": "Polish"
        }
    ],
    "application": {
        "name": "Workspace",
        "version": "0.0.1",
        "logo": "assets/images/hyland-logo.svg",
        "key": "hxps-runtime"
    },
    "headerColor": "#ffffff",
    "headerTextColor": "#000000",
    "customCssPath": "",
    "webFontPath": "",
    "custom-modeled-extension": ${APP_CONFIG_CUSTOM_MODELED_EXTENSION},
    "analytics": {
        "pendo": {
            "enabled" : "${APP_CONFIG_ANALYTICS_PENDO_ENABLED}",
            "key": "${APP_CONFIG_ANALYTICS_PENDO_KEY}",
            "disableGuides": "${APP_CONFIG_ANALYTICS_PENDO_DISABLE_GUIDES}",
            "excludeAllText": "${APP_CONFIG_ANALYTICS_PENDO_EXCLUDE_ALL_TEXT}"
        }
    },
    "customer": {
        "name": "${APP_CONFIG_CUSTOMER_NAME}"
    }
}
