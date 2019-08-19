const awaitTimeout = require('await-timeout');
const da_api = require('../../../src/FanartParser/apis/da_api.js');
const downloadFile = require('../../../src/FanartParser/browser/downloadFile.js');
const extractPageDocument = require('../../../src/FanartParser/browser/extractPageDocument.js');
const fa_api = require('../../../src/FanartParser/apis/fa_api.js');
const genArtFilename = require('../../../src/FanartParser/utils/genArtFilename.js');
const path = require('path');
const paths = require('../../../src/paths.js');
const prepArtFolder = require('../../../src/FanartParser/files/prepArtFolder.js');

const getParserType = (url) => {
    if ((/^https?:\/\/(?:[^.]+\.)?deviantart\.com/).test(url)) {
        return da_api;
    }

    if ((/^https?:\/\/(?:[^.]+\.)?furaffinity\.net/).test(url)) {
        return fa_api;
    }

    return {
        isValidPage: () => {
            return true;
        },
        parsePage: () => {
            return {};
        },
    };
};

const parsePage = (pageDocument, url, parserType) => {
    const data = parserType.parsePage(pageDocument, url);
    data.retrievedDate = Date.now();

    return data;
};

const getRandomIntBetween = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = async (url, browser) => {
    const page = await browser.newPage();

    const parserType = getParserType(url);

    const pageDocument = await extractPageDocument(page, url, parserType.isValidPage);
    const data = parsePage(pageDocument, url, parserType);

    await awaitTimeout.set(getRandomIntBetween(100, 2000));

    if (data._download && data._download.url) {
        const artFolderPath = await prepArtFolder(data.creator);
        console.log(`Downloading ${data.title} by ${data.creator}.`);

        const fullPath = path.join(artFolderPath, genArtFilename(data, data._download.extension));

        data.mainPath = path.relative(path.dirname(paths.store), fullPath);

        const didDownloadMain = await downloadFile(data._download, fullPath, browser);

        if (!didDownloadMain) {
            console.log(`Error: Failed to download ${path.parse(data.mainPath).base} main file.`);
        }

        delete data._download;
    }

    page.close();

    await awaitTimeout.set(getRandomIntBetween(200));

    return data;
};
