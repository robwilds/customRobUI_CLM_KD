/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const {
    getDeployedAppProxy,
    getIdentityAdapterServiceProxy,
    hxpContentRepositoryProxy
} = require('../../proxy-helpers');

const cloudHost = process.env.APP_CONFIG_BPM_HOST;
const ecmHost = process.env.APP_CONFIG_ECM_HOST;
const cloudApps = process.env.APP_CONFIG_APPS_DEPLOYED;

module.exports = {
    ...getDeployedAppProxy(cloudHost, cloudApps),
    ...getIdentityAdapterServiceProxy(cloudHost),
    ...hxpContentRepositoryProxy(ecmHost)
};
