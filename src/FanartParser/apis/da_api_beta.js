const globalThis = require('@ungap/global-this');
const turndown = require('turndown');

// Data is retrieved from the server-sent data JSON, not the page renderings themselves
const getDataScript = (doc) => {
    return Array.from(doc.querySelectorAll('script')).filter((script) => {
        return script.innerHTML.indexOf('window.__INITIAL_STATE__') !== -1;
    })[0];
}

const isBeta = (doc) => {
    return getDataScript(doc) !== void 0;
};

// Returns the state object or undefined if doesn't exist
const getDataState = (doc) => {
    try {
        const script = getDataScript(doc);

        globalThis.da_script_pull = {};

        eval(script.innerHTML.replace(/window\.__/g, 'da_script_pull.__'));

        const data = globalThis.da_script_pull.__INITIAL_STATE__;

        delete globalThis.da_script_pull;

        return data;
    } catch(e) {
        console.log('Problem reading the data in the script');

        throw e;
    }
};

const getExtensionFromUrl = (url) => {
    return url.match(/\.([^?.\W]+)(?:(?:\?token=)|$)/)[1].toLowerCase();
};

const getStatus = (entry) => {
    if (entry.isMature) {
        return 'mature';
    }

    if (entry.isAntisocial) {
        return 'login';
    }

    if (entry.isBlocked) {
        return 'blocked';
    }

    if (entry.isDeleted) {
        return 'deleted';
    }

    return 'normal';
};

const parsePage = (doc, id) => {
    const data = getDataState(doc);

    try {
        const entry = data['@@entities'].deviation[id];
        const extended = data['@@entities'].deviationExtended[id];

        const download = {};
        const resolution = {};

        if (extended.download) {
            download.url = extended.download.url;
            download.extension = getExtensionFromUrl(extended.download.url);

            resolution.w = extended.download.width;
            resolution.h = extended.download.height;
        }
        else {
            const file = entry.files.filter((file) => {
                return file.type === 'fullview';
            });

            download.url = file.src;
            download.extension = getExtensionFromUrl(file.src);

            resolution.w = file.width;
            resolution.h = file.height;
        }

        return {
            status: getStatus(entry),
            title: entry.title,
            creator: data['@@entities'].user[entry.author].username,
            description: (new turndown()).turndown(extended.description || ''),
            tags: (extended.tags || []).map((tag) => {
                return tag.name;
            }),
            publishedDate: new Date(entry.publishedTime).getTime(),
            resolution: resolution,
            _download: download,
        };
    } catch(e) {
        console.log('Problem reading the page (da-beta):');
        console.log(doc.body.parentNode.outerHTML);

        throw e;
    }
};

module.exports = {
    isBeta: isBeta,
    parsePage: parsePage,
};
