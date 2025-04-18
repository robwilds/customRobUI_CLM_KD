/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const logger = require('./tools/shared/es5/logger');

module.exports = {
    getDeployedAppProxy: function(processHost, deployedApps) {
        console.log(`Deployment`);
        let deployedAppProxy = {};
        if (deployedApps) {
            try {
                const appName = JSON.parse(deployedApps)[0]
                    .name;
                    console.log(`Fetch app: ${appName}`);
                const appPath = `/${appName}`;
                const appPathRewrite = `^/${appName}`;
                console.log(`Target for ${appPath}: ${processHost}`);
                deployedAppProxy = {
                    [appPath]: {
                        target: `${processHost}`,
                        secure: false,
                        pathRewrite: {
                            [appPathRewrite]: appName,
                        },
                        changeOrigin: true,
                    },
                };
            } catch (e) {
                logger.error(
                    `APP_CONFIG_APPS_DEPLOYED env var contains invalid data.`
                );
                logger.error(e.message);
            }
        }

        return deployedAppProxy;
    },
    getDeployedAppsProxy: function(processHost, deployedApps) {
        let deployedAppProxy = {};
        console.log(`Deployment`);
        if (deployedApps) {
            try {
                const deployedAppsArray = JSON.parse(deployedApps);
                for (const app of deployedAppsArray) {
                    const appName = app.name;
                    console.log(`Fetch app: ${appName}`);
                    const appPath = `/${appName}`;
                    const appPathRewrite = `^/${appName}`;
                    console.log(`Target for ${appPath}: ${processHost}`);
                    deployedAppProxy = {
                        ...deployedAppProxy,
                        [appPath]: {
                            target: `${processHost}`,
                            secure: false,
                            pathRewrite: {
                                [appPathRewrite]: appName,
                            },
                            changeOrigin: true,
                        },
                    };
                }
            } catch (e) {
                logger.error(
                    `APP_CONFIG_APPS_DEPLOYED env var contains invalid data.`
                );
                logger.error(e.message);
            }
        }

        return deployedAppProxy;
    },
    getIdentityProxy: function(host) {
        console.log('Target for /auth', host);
        return {
            '/auth': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    },
    getShareProxy: function(host) {
        console.log('Target for /alfresco', host);
        return {
            '/alfresco': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
                onProxyReq: function(request) {
                    if(request["method"] !== "GET")
                    request.setHeader("origin", host);
                },
                // workaround for REPO-2260
                onProxyRes: function (proxyRes, req, res) {
                    const header = proxyRes.headers['www-authenticate'];
                    if (header && header.startsWith('Basic')) {
                        proxyRes.headers['www-authenticate'] = 'x' + header;
                    }
                },
            },
        }
    },
    getApsProxy: function(host) {
        console.log('Target for /activiti-app', host);
        return {
            '/activiti-app': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    },
    getMicrosoftOfficeProxy: function(host) {
        console.log('Target for /ooi-service', host);
        return {
            '/ooi-service': {
                target: host,
                secure: false,
                changeOrigin: true,
            },
        }
    },
    getDeploymentServiceProxy: function(host) {
        console.log('Target for /deployment-service', host);
        return {
            '/deployment-service': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    },
    getModelingServiceProxy: function(host) {
        console.log('Target for /modeling-service', host);
        return {
            '/modeling-service': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    },
    getIdentityAdapterServiceProxy: function(host) {
        console.log('Target for /identity-adapter-service', host);
        return {
            '/identity-adapter-service': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    },
    hxpContentRepositoryProxy(ecmHost) {
        return {
            '/api': {
                target: ecmHost,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
                onProxyReq: function(request) {
                    request.removeHeader('origin');
                },
            }
        }
    },
    wsProxy(host) {
        console.log('Target for /wss/graphql', host);
        return {
            '/simpleapp/notifications/v2/ws/graphql': {
                target: host,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
                ws: true
            }
        }
    }
};
