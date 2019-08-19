const { promisify } = require('util');
const clearTemp = require('../../src/FanartParser/files/clearTemp.js');
const parseUrlAndDownload = require('../../src/FanartParser/ops/parseUrlAndDownload.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const paths = require('../../src/paths.js');

const awaitableReadFile = promisify(fs.readFile);
const awaitableWriteFile = promisify(fs.writeFile);

const examples = {
    // DeviantArt

    // daGifWithoutDownload: 'https://www.deviantart.com/oha/art/I-found-a-treasure-797388073',
    // daGifWithDownload: 'https://www.deviantart.com/oha/art/A-stardust-collector-797112696', // Also opens window for download
    // daDownloadTypeDiffersFromPreview: 'https://www.deviantart.com/recanto-feminino/art/Free-Cute-Fonts-Download-158578347',
    // daDownload: 'https://www.deviantart.com/pyremoonshadow/art/The-church-of-vengeance-797409676',
    // daDownloadWithNoExpansion: 'https://www.deviantart.com/yakovlev-vad/art/Bad-thoughts-Color-sketch-797409157',
    // daThumbWithExpansion: 'https://www.deviantart.com/chateaugrief/art/Oakland-Hills-767761100', // No download or access to the largest image
    // daOnlyThumb: 'https://www.deviantart.com/vianaarts/art/Leopard-Ballpoint-Pen-797362423', // No download or access to the larger image
    // daNoCommentsAllowed: 'https://www.deviantart.com/oha/art/Marie-Valentine-785817382',
    // noDescription: 'https://www.deviantart.com/111kitty111/art/furrie-3-krystal-359464917',
    // bannedUsername: 'https://www.deviantart.com/1scythe-prayer/art/No-good-talking-with-girls-LOL-108622654',

    // daLoginOnly: 'https://www.deviantart.com/mrkrystal/art/Other-M-Wallpaper-124677650', // Only visible to logged in users, data still visible
    // daMissing404: 'http://alvin-earthworm.deviantart.com/art/Krystal-attire-concept-1-91939983', // Art has been removed/hidden (no data)
    // daMatureRestricted: 'https://www.deviantart.com/desgar/art/Rivalry-Renewed-116518084', // Art not visible, data still visible
    // daRedirect: 'http://j-fujita.deviantart.com/art/Krystal-2006-39415302', // Art will be redirected to valid URL

    // FurAffinity

    // faNormal: 'https://www.furaffinity.net/view/31453161/',
    // faGif: 'https://www.furaffinity.net/view/16624100/',
    // faFullPath: 'https://www.furaffinity.net/full/18631843/',

    // faMissing404: 'https://www.furaffinity.net/view/26943818/', // No data, not even the URL correctly
    // faLoginOnly: 'https://www.furaffinity.net/view/31453321/', // No data
    // faMature: 'https://www.furaffinity.net/view/24543014/', // No data

    // TODO:

    // https://www.weasyl.com/ => Mostly duplicates, but about 300 arts
    // https://furry.ink/ => A very tiny handful are here, probably duplicates, very old site
    // https://inkbunny.net/ => Mostly duplicates, but probably some uniques in here, pretty large


};

(async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        // devtools: true,
        args: [
            '--safebrowsing-disable-download-protection',
        ],
    });

    await clearTemp();

    // const urls = Object.values(examples);

    let [datapath, start, end] = process.argv.slice(2);

    let content = '';
    try {
        content = String(await awaitableReadFile(datapath));
    } catch (e) {
        throw new Error(`Could not open file ${datapath}`);
    }

    let urls = content.split('\n');

    start = parseInt(start, 10);
    end = parseInt(end, 10);
    if (Object.is(start, NaN) || Object.is(end, NaN)) {
        start = 0;
        end = urls.length;
    }

    if (end <= start) {
        throw new Error('End of range must be larger than start of range');
    }

    urls = urls.slice(start, end);

    const dataList = [];

    for (let u = 0; u < urls.length; u += 1) {
        let data;

        try {
            data = await parseUrlAndDownload(urls[u], browser);
        } catch(e) {
            console.log('Errored during parsing, partial data below:');
            console.log(JSON.stringify(dataList, null, 4));
            console.log('Errored on url', urls[u]);

            await browser.close();
            throw e;
        }

        dataList.push(data);
    }

    await awaitableWriteFile(path.join(paths.store, `${start}-${end}.txt`), JSON.stringify(dataList, null, 4));

    // console.log(dataList)
    console.log('finished');

    await browser.close();
})();
