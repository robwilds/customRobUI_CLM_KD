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

const scriptRootOffset = '../..';
const sourceFile = process.argv[2];
const targetFile = process.argv[3];

const sourceFileFullPath = path.resolve(__dirname, scriptRootOffset, sourceFile);
const targetFileFullPath = path.resolve(__dirname, scriptRootOffset,  targetFile);

fs.copyFileSync(sourceFileFullPath, targetFileFullPath);
