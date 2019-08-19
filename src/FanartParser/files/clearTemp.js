const del = require('del');
const paths = require('../../../src/paths.js');

module.exports = async () => {
    await del(paths.temp);
};
