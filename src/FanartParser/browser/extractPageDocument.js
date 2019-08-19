const { JSDOM } = require('jsdom');

const blockedResourceTypes = new Set(['image', 'stylesheet', 'font', 'script']);

const blockLoadingUnnecessary = async (page) => {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (blockedResourceTypes.has(request.resourceType())) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
};

const tryLoadPage = async (page, url, isValidPage, tries) => {
    let source = '<!doctype html><html><title>Default</title>';

    try {
        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

        source = await page.evaluate(() => {
            return document.querySelector('html').outerHTML;
        });
    } catch (e) {
        if (tries > 0) {
            return tryLoadPage(page, url, isValidPage, tries - 1);
        }

        console.log('Could not extract source page document:', url);
        console.log(e);
    }

    const dom = new JSDOM(source);

    const doc = dom.window.document;

    if (!isValidPage(doc)) {
        if (tries > 0) {
            return tryLoadPage(page, url, isValidPage, tries - 1);
        }
        else {
            console.log('Page data in unrecognized form:');
            console.log(doc.body.parentNode.outerHTML);
        }
    }

    return doc;
};

module.exports = async (page, url, isValidPage) => {
    blockLoadingUnnecessary(page);

    return await tryLoadPage(page, url, isValidPage, 3);
};
