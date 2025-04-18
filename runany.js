const { execSync } = require('child_process');
const os = require('os').platform() === 'win32' ? 'windows' : 'unix';

const command = process.argv[2];
const args = process.argv.slice(3).join(' ');

const commands = {
    'ng-build': {
        windows: 'set NG_CLI=./node_modules/@angular/cli/bin/ng && set NX_CLI_SET=true && npm run build --',
        unix: 'NG_CLI=./node_modules/@angular/cli/bin/ng NX_CLI_SET=true npm run build --',
    },
    'ng-start': {
        windows: 'set NG_CLI=./node_modules/@angular/cli/bin/ng && set NX_CLI_SET=true && npm start --',
        unix: 'NG_CLI=./node_modules/@angular/cli/bin/ng NX_CLI_SET=true npm start --',
    },
    build: {
        windows: 'set NODE_OPTIONS=--max_old_space_size=8192 && nx build',
        unix: "NODE_OPTIONS=${NODE_OPTIONS:-'--max_old_space_size=8192'} ${NG_CLI:-nx} build",
    },
    start: {
        windows: 'set NODE_OPTIONS=--max_old_space_size=8192 && nx serve',
        unix: "NODE_OPTIONS=${NODE_OPTIONS:-'--max_old_space_size=8192'} ${NG_CLI:-nx} serve",
    },
    test: {
        windows: 'nx test',
        unix: '${NG_CLI:-nx} test',
    },
    lint: {
        windows: 'nx lint',
        unix: '${NG_CLI:-nx} lint',
    },
    e2e: {
        windows: 'set NODE_OPTIONS=%NODE_OPTIONS% --unhandled-rejections=throw --report-uncaught-exception && nx e2e',
        unix: 'NODE_OPTIONS="$NODE_OPTIONS --unhandled-rejections=throw --report-uncaught-exception" ${NG_CLI:-nx} e2e --',
    },
    'pack-build': {
        windows: 'set NODE_OPTIONS=--max_old_space_size=8192 && nx pack-build',
        unix: "NODE_OPTIONS=${NODE_OPTIONS:-'--max_old_space_size=8192'} ${NG_CLI:-nx} pack-build",
    },
};

const finalCommand = commands[command][os] + ' ' + args;

execSync(finalCommand, { stdio: 'inherit', shell: true });
