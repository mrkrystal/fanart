const mkdirp = require('mkdirp');
const path = require('path');
const paths = require('../../../src/paths.js');
const sanitize = require('../../../src/FanartParser/utils/sanitize.js');

module.exports = async (creator) => {
    const creatorFolder = path.join(paths.store, sanitize(creator));

    // Create creator directory
    await mkdirp(creatorFolder);

    return creatorFolder;
};
