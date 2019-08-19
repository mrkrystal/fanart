const { promisify } = require('util');
const awaitTimeout = require('await-timeout');
const del = require('del');
const downloadFile = require('download-file');
const fs = require('fs');
const moveFile = require('../../../src/FanartParser/files/moveFile.js');
const path = require('path');
const pollDownloadedFile = require('../../../src/FanartParser/files/pollDownloadedFile.js');
const prepTempFolder = require('../../../src/FanartParser/files/prepTempFolder.js');

const awaitableDownloadFile = promisify(downloadFile);
const awaitableWriteFile = promisify(fs.writeFile);

const tryDownloadDirect = async (downloadDetails, filePath) => {
    const pathParts = path.parse(filePath);

    try {
        await awaitableDownloadFile(downloadDetails.url, {
            directory: pathParts.dir,
            filename: pathParts.base,
        });

        await awaitTimeout.set(1000);

        return true;
    } catch(e) {
        return false;
    }
};

const tryDownloadOpenFile = async (filePath, downloadPage) => {
    try {
        const tree = await downloadPage._client.send('Page.getResourceTree');

        const { content } = await downloadPage._client.send('Page.getResourceContent', {
            frameId: String(downloadPage.mainFrame()._id),
            url: tree.frameTree.frame.url,
        });

        const contentBuffer = Buffer.from(content, 'base64');

        await awaitableWriteFile(filePath, contentBuffer, 'base64');

        return true;
    } catch(e) {
        return false;
    }
};

const tryDownloadAttachmentPoll = async (filePath, tempPath) => {
    // The file is already downloading to our temp folder, poll for completion.
    const downloadedFileName = await pollDownloadedFile(tempPath);

    await moveFile(path.join(tempPath, downloadedFileName), filePath);

    // At this point, the page should already have auto-closed because of how Chrome handles attachment downloads.

    return Boolean(downloadedFileName);
};

const tryDownloadOpenOrAttachment = async (downloadDetails, filePath, browser) => {
    const tempPath = await prepTempFolder();

    const downloadPage = await browser.newPage();
    await downloadPage._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: tempPath,
    });

    let didDownload = false;

    try {
        await downloadPage.goto(downloadDetails.url, {
            waitUntil: 'networkidle2',
        });

        await awaitTimeout.set(1000);

        // At this point, the image should be finished loading on the page, save to final location
        didDownload = await tryDownloadOpenFile(filePath, downloadPage);

        downloadPage.close();
    } catch (e) {
        // If the operation aborted, this means the file was an attachment download from the server.
        didDownload = await tryDownloadAttachmentPoll(filePath, tempPath);
    }

    await del(tempPath);

    return didDownload;
};

module.exports = async (downloadDetails, filePath, browser) => {
    let didDownload = await tryDownloadDirect(downloadDetails, filePath);

    if (!didDownload) {
        didDownload = await tryDownloadOpenOrAttachment(downloadDetails, filePath, browser);
    }

    return didDownload;
};
