/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// This script can be used on both Linux and Windows systems

const fs = require('fs');
const path = require('path');

const tmpFolderPath = process.argv[2];

const dir = path.join(__dirname, '../..', tmpFolderPath);

console.log(`Removing project ${tmpFolderPath} folder if exist`);
fs.rmSync(dir, { recursive: true, force: true });

console.log(`Create ${tmpFolderPath} folder`);
fs.mkdirSync(dir);
