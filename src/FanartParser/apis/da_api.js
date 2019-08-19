const da_api_beta = require('../../../src/FanartParser/apis/da_api_beta.js');
const da_api_old = require('../../../src/FanartParser/apis/da_api_old.js');

const isValidPage = (doc) => {
    return doc.querySelector('meta[property="og:type"]') !== null && doc.querySelector('title').innerHTML !== 'DeviantArt: 500 Internal Server Error';
};

// Deviation Numberical ID
// Pull last /d set from url
const parseId = (url) => {
    return url.match(/(\d+)\/?$/)[1];
};

const is404 = (doc) => {
    const title = doc.querySelector('title').innerHTML;
    return title === '404 Not Found | DeviantArt' || title === 'DeviantArt: 404';
};

const parsePage = (doc, url) => {
    const id = parseId(url);

    let data = {
        id: id,
        pageUrl: url,
        location: 'da',
    };

    if (is404(doc)) {
        data.status = '404';
    }
    else if (da_api_beta.isBeta(doc)) {
        data = {
            ...data,
            ...da_api_beta.parsePage(doc, id),
        };
    }
    else {
        data = {
            ...data,
            ...da_api_old.parsePage(doc, id),
        };
    }

    return data;
};

module.exports = {
    isValidPage: isValidPage,
    parsePage: parsePage,
};
