const del = require('del');
const mkdirp = require('mkdirp');
const path = require('path');
const paths = require('../../../src/paths.js');

module.exports = async () => {
    const tempPath = path.join(paths.temp, `${Date.now()}-${Math.round(Math.random() * 10000)}`);

    // Create temp directory and make sure it's empty
    await mkdirp(tempPath);
    await del(`${tempPath}/*`);

    return tempPath;
};
