const turndown = require('turndown');

const getStatus = (doc) => {
    // Mature (images restricted, data available)
    // <div class="dev-content-mature mzone-main mzone-agegate">...
    if (doc.querySelectorAll('.mzone-agegate').length > 0) {
        return 'mature';
    }

    // Restricted to Logged In (images restricted, data available)
    // <div id="filter-warning" class="antisocial">...
    if (doc.querySelectorAll('#filter-warning.antisocial').length > 0) {
        return 'login';
    }

    // TODO: blocked, deleted

    return 'normal';
};

const parseTitle = (doc) => {
    return doc.querySelector('a.title').innerHTML;
};

const parseCreator = (doc) => {
    return doc.querySelector('.author span.username-with-symbol > .username').innerHTML;
};

const parseDescription = (doc) => {
    let el = doc.querySelector('.dev-description');

    return !el ? '' : (new turndown()).turndown(el.innerHTML);
};

const parseTags = (doc) => {
    return Array.from(doc.querySelectorAll('a.discoverytag')).map((el) => {
        return el.getAttribute('data-canonical-tag');
    });
};

const parsePublishDate = (doc) => {
    return Number(doc.querySelector('div.dev-metainfo-details dd span[ts]').getAttribute('ts') + '000');
};

const parseResolution = (doc) => {
    const resolutionElement = Array.from(doc.querySelector('div.dev-metainfo-details').querySelectorAll('dd')).find((dd) => {
        return (/^\d+×\d+$/).test(dd.innerHTML);
    });

    if (!resolutionElement) {
        return {};
    }

    const parts = resolutionElement.innerHTML.split('×');
    return {
        w: Number(parts[0]),
        h: Number(parts[1]),
    };
};

const parseDownloadDetails = (doc) => {
    let el = doc.querySelector('a[data-download_url]');

    if (el) {
        return {
            url: el.getAttribute('href'),
            extension: el.querySelector('.text').innerHTML.split(/\s+/)[0].toLowerCase(),
        };
    }

    el = doc.querySelector('img.dev-content-full');

    if (!el) {
        el = doc.querySelector('img.dev-content-normal');
    }

    if (el) {
        const imageUrl = el.getAttribute('src');

        return {
            url: imageUrl,
            extension: imageUrl.match(/\.([^?.\W]+)(?:(?:\?token=)|$)/)[1].toLowerCase(),
        };
    }

    el = doc.querySelector('.dev-view-deviation iframe');

    if (!el) {
        return {};
    }

    return {
        url: el.getAttribute('src'),
        extension: 'swf',
    };
};

const parsePage = (doc, id) => {
    try {
        const status = getStatus(doc);

        const data = {
            status: status,
            title: parseTitle(doc),
            creator: parseCreator(doc),
            description: parseDescription(doc),
            tags: parseTags(doc),
            publishedDate: parsePublishDate(doc),
            resolution: parseResolution(doc),
        };

        if (status !== 'normal') {
            return data;
        }

        data._download = parseDownloadDetails(doc);

        return data;
    } catch(e) {
        console.log('Problem reading the page (da-old):');
        console.log(doc.body.parentNode.outerHTML);

        throw e;
    }
};

module.exports = {
    parsePage: parsePage,
};
