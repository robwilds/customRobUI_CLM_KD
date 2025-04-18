// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

const logger = require('@alfresco-dbp/monorepo/utils').logger;
const fs = require('fs');
const merge = require('deepmerge-json');

const WRAPPER_BEGIN = '"<<<___';
const WRAPPER_END = '___>>>"';

// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

function loadSanitizedConfigPart(path) {
    // Can not require, since it might not be a valid json because of env var substitutions
    const jsonConfigTemplate = fs.readFileSync(path, 'utf-8');
    // We need to wrap the invalid parts to make it a valid JSON object
    const validJsonObject = jsonConfigTemplate.replace(/:\s*(\$\{?[a-zA-Z0-9_]*}?)/g, `: ${WRAPPER_BEGIN}$1${WRAPPER_END}`);
    return JSON.parse(validJsonObject);
}

// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

function templatify(jsonObject) {
    // Remove previously wrappers
    return JSON.stringify(jsonObject, null, 2).replace(new RegExp(WRAPPER_BEGIN, 'g'), '').replace(new RegExp(WRAPPER_END, 'g'), '');
}

// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
function forgeAppConfigJson(
    rootConfigPath,
    appConfigOutputPath,
    processServiceExtPath,
    extensions
) {
    const packageJsonVersion = require('./package.json').version;

    let appADWConfig = loadSanitizedConfigPart(rootConfigPath);

    if (processServiceExtPath) {
        const processServiceExtConfig = loadSanitizedConfigPart(processServiceExtPath);
        appADWConfig = merge(appADWConfig, processServiceExtConfig);
    }

    appADWConfig.application.version = packageJsonVersion;

    fs.writeFileSync(appConfigOutputPath, templatify(appADWConfig));
}

// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT
// DO NOT ADD ANYTHING TO THIS FILE, WE WANT TO REMOVE IT

module.exports.forgeAppConfigJson = forgeAppConfigJson;
