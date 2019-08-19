const turndown = require('turndown');

const getPageStatus = (doc) => {
    // 404
    // <title>System Error</title>
    if (doc.querySelector('title').innerHTML === 'System Error') {
        return '404';
    }

    // TODO: Private?

    // Mature (images restricted, data available)
    // <meta name="twitter:data2" content="Adult" />
    // <meta name="twitter:data2" content="Mature" />
    const rating = doc.querySelector('meta[name="twitter:data2"]').getAttribute('content');
    if (rating === 'Adult' || rating === 'Mature') {
        return 'mature';
    }

    // Restricted to Logged In (images restricted, data available)
    // <p class="link-override">The owner of this page has elected to make it available to registered users only.<br />...</p>
    const override = doc.querySelector('.link-override');
    if (override && override.innerHTML.substring(59, 75) === 'registered users') {
        return 'login';
    }

    return 'normal';
};

// FurAffinity ID
// <meta property="og:url" content="http://www.furaffinity.net/view/31453161/" />
// Pull last /d set from url
const manualParseId = (url) => {
    return url.match(/(\d+)\/?$/)[1];
};

// Title
// <div class="classic-submission-title information"><h2>:Draw This Again: The Vixen of Blue</h2>...</div>
const parseTitle = (doc) => {
    return doc.querySelector('.classic-submission-title.information h2').innerHTML;
};

// Creator
// <div class="classic-submission-title information">...by <a href="/user/danirap/">danirap</a></div>
const parseCreator = (doc) => {
    return doc.querySelector('.classic-submission-title.information a').innerHTML;
};

// Description
// The main table (found by looking at parents of .classic-submission-title), find the very last tr, and that one's td content is the description
// Converted to Markdown
const parseDescription = (doc) => {
    return (new turndown()).turndown(Array.from(doc.querySelector('.classic-submission-title').closest('table').querySelectorAll('tr')).pop().querySelector('td').innerHTML);
};

// Tags
// <div id="keywords">...<a href="/search/@keywords wolf">wolf</a>...
const parseTags = (doc) => {
    return Array.from(doc.querySelectorAll('#keywords a')).map((el) => {
        return el.innerHTML;
    });
};

// Publish Date/Time
// <td valign="top" align="left" class="alt1 stats-container">...<span title="May 7th, 2019 03:42 AM" class="popup_date">a month ago</span>...
// Get the date, then remove the ordinal, then convert to date
const parsePublishDate = (doc) => {
    return new Date(doc.querySelector('.stats-container .popup_date').getAttribute('title').replace(/(\d)(?:(?:st)|(?:nd)|(?:rd)|(?:th)),/, '$1,')).getTime();
};

// Original File Resolution
// <td valign="top" align="left" class="alt1 stats-container">...<b>Resolution:</b> 1280x1119<br><br>...
const parseResolution = (doc) => {
    const resolutionElementSibling = Array.from(doc.querySelectorAll('td.stats-container b')).find((b) => {
        return b.innerHTML === 'Resolution:';
    });

    // Not a text node
    if (resolutionElementSibling.nextSibling.nodeType !== 3) {
        return {};
    }

    const parts = resolutionElementSibling.nextSibling.wholeText.match(/(\d+)x(\d+)/);

    return {
        w: Number(parts[1]),
        h: Number(parts[2]),
    };
};

// Download URL
// <div class="actions">...<b><a href="//d.facdn.net/art/danirap/1557225817/1557225770.danirap_the-vixen-of-blue-_remake_.jpg">Download</a></b>...
const parseDownloadDetails = (doc) => {
    const link = Array.from(doc.querySelectorAll('.actions a')).find((element) => {
        return element.innerHTML === 'Download';
    });

    if (!link) {
        return {};
    }

    return {
        url: link.href,
        extension: link.href.match(/\.([^?.\W]+)$/)[1].toLowerCase(),
    };
};

const parsePage = (doc, url) => {
    const status = getPageStatus(doc);

    const data = {
        status: status,
        location: 'fa',
    };

    if (status === '404' || status === 'mature' || status === 'login') {
        data.id = manualParseId(url);
        data.pageUrl = url;

        return data;
    }

    data.id = manualParseId(url);
    data.pageUrl = url;
    data.title = parseTitle(doc);
    data.creator = parseCreator(doc);
    data.description = parseDescription(doc);
    data.tags = parseTags(doc);
    data.publishedDate = parsePublishDate(doc);
    data.resolution = parseResolution(doc);

    data._download = parseDownloadDetails(doc);

    return data;
};

module.exports = {
    parsePage: parsePage,
};
