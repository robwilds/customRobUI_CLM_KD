const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
const baseConfig = getBaseKarmaConfig();
config.set({
    ...baseConfig,
    coverageReporter: {
        ...baseConfig.coverageReporter,
        dir: require('path').join(__dirname, 'coverage'),
        dir: join(__dirname, '../../../coverage/libs/content-ee/process-services-cloud-extension'),
    },
});
};
