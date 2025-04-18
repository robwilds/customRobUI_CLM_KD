#!/usr/bin/env node

const { join } = require('path');
const forgeAppConfigJson = require('../../setup-helpers-remove-me').forgeAppConfigJson;

forgeAppConfigJson(
    `${process.cwd()}/src/app.config.json.tpl`,
    `${process.cwd()}/.tmp/app.config.json.tpl`,
    join('..', '..', 'libs/content-ee/process-services-cloud-extension/src/app.config-extension.json.tpl')
);
