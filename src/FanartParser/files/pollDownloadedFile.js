const { promisify } = require('util');
const awaitTimeout = require('await-timeout');
const fs = require('fs');

const awaitableReaddir = promisify(fs.readdir);

module.exports = async (tempPath) => {
    let attemptCount = 0;
    let downloadedFileName = '';

    do {
        await awaitTimeout.set(500);

        downloadedFileName = (await awaitableReaddir(tempPath)).filter((name) => {
            return name !== '.DS_Store';
        })[0];

        attemptCount += 1;
        if (attemptCount > 10) {
            break;
        }
    } while (!downloadedFileName || downloadedFileName.endsWith('.crdownload'));

    return downloadedFileName;
};
